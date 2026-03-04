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

// Free tier daily query tracking
const dailyQueries = new Map<string, { count: number; date: string }>();
const FREE_DAILY_LIMIT = 5;

/** Check and increment free-tier daily voice query count. */
export function checkFreeQueryLimit(identifier: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const entry = dailyQueries.get(identifier);

  if (!entry || entry.date !== today) {
    dailyQueries.set(identifier, { count: 1, date: today });
    return { allowed: true, remaining: FREE_DAILY_LIMIT - 1 };
  }

  if (entry.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: FREE_DAILY_LIMIT - entry.count };
}
