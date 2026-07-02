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
  if (!STRIPE_SECRET_KEY) {
    res.status(503).json({ error: 'billing_disabled' });
    return;
  }

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

/** POST /billing/verify-receipt — Verify iOS/Android IAP receipt with Apple/Google servers. */
billingRouter.post('/verify-receipt', requireAuth, async (req: AuthRequest, res) => {
  const { platform, receipt, productId } = req.body;
  const userId = req.userId!;

  if (!platform || !receipt || !productId) {
    res.status(400).json({ error: 'platform, receipt, and productId required' });
    return;
  }

  const VALID_PRODUCTS = ['ummat_plus_yearly'];
  if (!VALID_PRODUCTS.includes(productId)) {
    res.status(400).json({ error: 'Unknown product', validProducts: VALID_PRODUCTS });
    return;
  }

  try {
    if (platform === 'ios') {
      const verified = await verifyAppleReceipt(receipt);
      if (!verified.valid) {
        res.status(403).json({ error: 'Invalid receipt', detail: verified.reason });
        return;
      }

      await upsertSubscription(userId, {
        plan: 'plus',
        status: 'active',
        currentPeriodEnd: verified.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      res.json({ status: 'active', plan: 'plus' });
    } else if (platform === 'android') {
      const verified = await verifyGoogleReceipt(receipt, productId);
      if (!verified.valid) {
        res.status(403).json({ error: 'Invalid receipt', detail: verified.reason });
        return;
      }

      await upsertSubscription(userId, {
        plan: 'plus',
        status: 'active',
        currentPeriodEnd: verified.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      res.json({ status: 'active', plan: 'plus' });
    } else {
      res.status(400).json({ error: 'Unsupported platform. Use "ios" or "android"' });
    }
  } catch (err) {
    console.error('[BILLING] Receipt verification error:', err);
    res.status(500).json({ error: 'Receipt verification failed' });
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

// Apple receipt verification

interface ReceiptVerificationResult {
  valid: boolean;
  reason?: string;
  expiresAt?: string;
}

const APPLE_PROD_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

async function verifyAppleReceipt(receiptData: string): Promise<ReceiptVerificationResult> {
  const payload = {
    'receipt-data': receiptData,
    password: process.env.APPLE_SHARED_SECRET || '',
    'exclude-old-transactions': true,
  };

  // Try production first
  let response = await fetch(APPLE_PROD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = await response.json() as any;

  // Status 21007 means it's a sandbox receipt — retry against sandbox
  if (data.status === 21007) {
    response = await fetch(APPLE_SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    data = await response.json() as any;
  }

  if (data.status !== 0) {
    return { valid: false, reason: `Apple verification failed with status ${data.status}` };
  }

  // Extract the latest subscription expiry from the receipt
  const latestInfo = data.latest_receipt_info;
  if (Array.isArray(latestInfo) && latestInfo.length > 0) {
    const latest = latestInfo[latestInfo.length - 1];
    const expiresMs = parseInt(latest.expires_date_ms, 10);
    if (expiresMs && expiresMs > Date.now()) {
      return { valid: true, expiresAt: new Date(expiresMs).toISOString() };
    }
    return { valid: false, reason: 'Subscription has expired' };
  }

  // Non-subscription IAP (one-time purchase) — valid if status is 0
  return { valid: true };
}

// Google Play receipt verification

async function verifyGoogleReceipt(purchaseToken: string, productId: string): Promise<ReceiptVerificationResult> {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('[BILLING] GOOGLE_SERVICE_ACCOUNT_KEY not configured');
    return { valid: false, reason: 'Google verification not configured' };
  }

  try {
    const keyData = JSON.parse(serviceAccountKey);
    const accessToken = await getGoogleAccessToken(keyData);

    const packageName = process.env.GOOGLE_PACKAGE_NAME || 'com.praycalc.app';
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { valid: false, reason: `Google API error: ${response.status} ${errorText}` };
    }

    const data = await response.json() as any;

    // Check payment state: 0 = pending, 1 = received, 2 = free trial, 3 = deferred
    if (data.paymentState === undefined || data.paymentState < 1) {
      return { valid: false, reason: 'Payment not received' };
    }

    // Check cancellation
    if (data.cancelReason !== undefined && data.cancelReason !== null) {
      return { valid: false, reason: 'Subscription was canceled' };
    }

    const expiryTimeMs = parseInt(data.expiryTimeMillis, 10);
    if (expiryTimeMs && expiryTimeMs > Date.now()) {
      return { valid: true, expiresAt: new Date(expiryTimeMs).toISOString() };
    }

    return { valid: false, reason: 'Subscription has expired' };
  } catch (err) {
    console.error('[BILLING] Google receipt verification error:', err);
    return { valid: false, reason: 'Google verification failed' };
  }
}

/** Get a Google OAuth2 access token from a service account key. */
async function getGoogleAccessToken(keyData: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: keyData.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${encode(header)}.${encode(payload)}`;

  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(keyData.private_key, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json() as any;
  if (!tokenData.access_token) {
    throw new Error(`Failed to get Google access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}
