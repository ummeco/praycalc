import NodeCache from 'node-cache';

/** Subscription status check. In production, queries umm_subscriptions via Hasura. */

const statusCache = new NodeCache({ stdTTL: 300, maxKeys: 5000 }); // 5 min cache

export type SubscriptionPlan = 'free' | 'plus';

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiresAt: string | null;
}

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

/** Check subscription status for a user. */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const cached = statusCache.get<SubscriptionStatus>(userId);
  if (cached) return cached;

  try {
    const response = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `query GetSubscription($userId: uuid!) {
          umm_subscriptions_by_pk(user_id: $userId) {
            plan
            status
            current_period_end
          }
        }`,
        variables: { userId },
      }),
    });

    const data = await response.json() as any;
    const sub = data?.data?.umm_subscriptions_by_pk;

    const status: SubscriptionStatus = sub
      ? {
          plan: sub.plan as SubscriptionPlan,
          isActive: sub.status === 'active' || sub.status === 'trialing',
          expiresAt: sub.current_period_end,
        }
      : { plan: 'free', isActive: false, expiresAt: null };

    statusCache.set(userId, status);
    return status;
  } catch (err) {
    console.error('[SUBSCRIPTION] Failed to check status:', err);
    // Fail open: treat as free user
    return { plan: 'free', isActive: false, expiresAt: null };
  }
}

/** Check if user has Ummat+ access. */
export async function hasUmmatPlus(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const status = await getSubscriptionStatus(userId);
  return status.plan === 'plus' && status.isActive;
}

// Free tier daily query tracking via Hasura
const FREE_DAILY_LIMIT = 5;

/** Check and increment free-tier daily voice query count. Uses pc_free_tier_usage table. */
export async function checkFreeQueryLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Ensure a row exists for today (insert with count=0 if not present, do nothing on conflict)
    await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `mutation EnsureFreeTierRow($identifier: String!, $date: date!) {
          insert_pc_free_tier_usage_one(
            object: { identifier: $identifier, date: $date, count: 0 }
            on_conflict: { constraint: pc_free_tier_usage_pkey, update_columns: [] }
          ) { identifier }
        }`,
        variables: { identifier, date: today },
      }),
    });

    // Atomically increment and return the new count
    const incrResult = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `mutation IncrementFreeTierUsage($identifier: String!, $date: date!) {
          update_pc_free_tier_usage_by_pk(
            pk_columns: { identifier: $identifier, date: $date }
            _inc: { count: 1 }
          ) {
            count
          }
        }`,
        variables: { identifier, date: today },
      }),
    });

    const incrData = await incrResult.json() as any;
    const newCount = incrData?.data?.update_pc_free_tier_usage_by_pk?.count || 1;

    if (newCount > FREE_DAILY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: FREE_DAILY_LIMIT - newCount };
  } catch (err) {
    console.error('[SUBSCRIPTION] Failed to check free tier usage:', err);
    // Fail open: allow the query
    return { allowed: true, remaining: FREE_DAILY_LIMIT - 1 };
  }
}
