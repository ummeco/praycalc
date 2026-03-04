import { Router, raw } from 'express';
import Stripe from 'stripe';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const billingRouter = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
    _stripe = new Stripe(STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/** POST /billing/checkout — Create a Stripe Checkout session. */
billingRouter.post('/checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.body.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || '',
          quantity: 1,
        },
      ],
      success_url: 'https://praycalc.com/upgrade/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://praycalc.com/upgrade',
      metadata: {
        userId: req.userId!,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[BILLING] Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/** GET /billing/status — Check subscription status.
 *  Returns { plan, status, isActive, expiresAt, currentPeriodEnd } for broad client compatibility.
 */
billingRouter.get('/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const sub = await querySubscription(req.userId!);
    if (!sub) {
      res.json({ plan: 'free', status: 'none', isActive: false, expiresAt: null, currentPeriodEnd: null });
      return;
    }
    const isActive = sub.status === 'active' || sub.status === 'trialing';
    res.json({
      plan: sub.plan || 'free',
      status: sub.status || 'none',
      isActive,
      expiresAt: sub.currentPeriodEnd || null,
      currentPeriodEnd: sub.currentPeriodEnd || null,
    });
  } catch (err) {
    console.error('[BILLING] Status error:', err);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

/** POST /billing/portal — Create Stripe Customer Portal session. */
billingRouter.post('/portal', requireAuth, async (req: AuthRequest, res) => {
  try {
    const sub = await querySubscription(req.userId!);
    if (!sub?.stripeCustomerId) {
      res.status(404).json({ error: 'No subscription found' });
      return;
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: 'https://praycalc.com/account',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[BILLING] Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/** POST /billing/webhook — Stripe webhook handler. */
billingRouter.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[BILLING] Webhook signature verification failed');
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await upsertSubscription(userId, {
          plan: 'plus',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: 'active',
        });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = invoice.subscription as string;
      if (sub) {
        const subscription = await getStripe().subscriptions.retrieve(sub);
        const userId = subscription.metadata?.userId;
        if (userId) {
          await upsertSubscription(userId, {
            plan: 'plus',
            status: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await upsertSubscription(userId, {
          status: subscription.status === 'active' ? 'active' : subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await upsertSubscription(userId, {
          plan: 'free',
          status: 'canceled',
        });
      }
      break;
    }
  }

  res.json({ received: true });
});

/** POST /billing/verify-receipt — Verify iOS/Android IAP receipt. */
billingRouter.post('/verify-receipt', requireAuth, async (req: AuthRequest, res) => {
  const { platform, receipt, productId } = req.body;
  const userId = req.userId!;

  // In production: verify receipt with Apple/Google servers
  // For now: trust client and upsert subscription
  if (!platform || !receipt || !productId) {
    res.status(400).json({ error: 'platform, receipt, and productId required' });
    return;
  }

  if (productId === 'ummat_plus_yearly') {
    await upsertSubscription(userId, {
      plan: 'plus',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
    res.json({ status: 'active', plan: 'plus' });
  } else {
    res.status(400).json({ error: 'Unknown product' });
  }
});

// Database helpers

interface SubscriptionRecord {
  plan?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status?: string;
  currentPeriodEnd?: string;
}

async function querySubscription(userId: string): Promise<(SubscriptionRecord & { stripeCustomerId?: string }) | null> {
  try {
    const response = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `query($userId: uuid!) {
          umm_subscriptions_by_pk(user_id: $userId) {
            plan status stripe_customer_id stripe_subscription_id current_period_end
          }
        }`,
        variables: { userId },
      }),
    });
    const data = await response.json() as any;
    const sub = data?.data?.umm_subscriptions_by_pk;
    return sub ? {
      plan: sub.plan,
      status: sub.status,
      stripeCustomerId: sub.stripe_customer_id,
      stripeSubscriptionId: sub.stripe_subscription_id,
      currentPeriodEnd: sub.current_period_end,
    } : null;
  } catch {
    return null;
  }
}

async function upsertSubscription(userId: string, data: SubscriptionRecord): Promise<void> {
  try {
    await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `mutation($userId: uuid!, $plan: String, $status: String, $stripeCustomerId: String, $stripeSubscriptionId: String, $currentPeriodEnd: timestamptz) {
          insert_umm_subscriptions_one(
            object: {
              user_id: $userId
              plan: $plan
              status: $status
              stripe_customer_id: $stripeCustomerId
              stripe_subscription_id: $stripeSubscriptionId
              current_period_end: $currentPeriodEnd
            }
            on_conflict: {
              constraint: umm_subscriptions_user_id_key
              update_columns: [plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at]
            }
          ) { user_id }
        }`,
        variables: {
          userId,
          plan: data.plan || 'free',
          status: data.status || 'active',
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
          currentPeriodEnd: data.currentPeriodEnd || null,
        },
      }),
    });
  } catch (err) {
    console.error('[BILLING] Upsert subscription failed:', err);
  }
}
