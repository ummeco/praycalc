/**
 * Prayer stats route.
 *
 * GET /api/v1/stats — Return processed prayer stats for the authenticated user.
 *   Reads pc_prayer_logs (single row per user, logs is a JSON object mapping
 *   "YYYY-MM-DD_Prayer" → ISO timestamp) from Hasura and computes:
 *   - Weekly counts per prayer (last 7 days)
 *   - Monthly counts per prayer (last 30 days)
 *   - Weekly and monthly completion percentages
 *   - Current streak (consecutive days with all 5 fard prayed)
 *   - Most consistent and most missed prayer names
 */

import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const statsRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

const FARD = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

async function fetchPrayerLogs(userId: string): Promise<Record<string, string>> {
  const res = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: `query GetLogs($uid: uuid!) {
        pc_prayer_logs_by_pk(user_id: $uid) { logs }
      }`,
      variables: { uid: userId },
    }),
  });
  const json = await res.json() as { data?: { pc_prayer_logs_by_pk?: { logs?: unknown } } };
  const raw = json.data?.pc_prayer_logs_by_pk?.logs;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as Record<string, string>;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computeStats(logs: Record<string, string>) {
  const now = new Date();
  const weekCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weekly: Record<string, number> = {};
  const monthly: Record<string, number> = {};
  let totalLogged = 0;

  for (const [key, val] of Object.entries(logs)) {
    const parts = key.split('_');
    if (parts.length !== 2) continue;
    const prayer = parts[1];
    if (!FARD.includes(prayer as typeof FARD[number])) continue;

    let completedAt: Date;
    try { completedAt = new Date(val); } catch { continue; }

    totalLogged++;
    if (completedAt > weekCutoff) weekly[prayer] = (weekly[prayer] ?? 0) + 1;
    if (completedAt > monthCutoff) monthly[prayer] = (monthly[prayer] ?? 0) + 1;
  }

  const weekTotal = FARD.reduce((s, p) => s + (weekly[p] ?? 0), 0);
  const monthTotal = FARD.reduce((s, p) => s + (monthly[p] ?? 0), 0);

  // Streak: consecutive days with all 5 fard
  let streak = 0;
  for (let d = 0; d < 365; d++) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const ds = toDateString(date);
    const allDone = FARD.every(p => logs[`${ds}_${p}`]);
    if (allDone) streak++;
    else if (d > 0) break; // yesterday not done — streak ends
  }

  // Most consistent / most missed (last 7 days)
  let maxCount = -1;
  let minCount = 8;
  let mostConsistent: string | null = null;
  let mostMissed: string | null = null;
  for (const p of FARD) {
    const c = weekly[p] ?? 0;
    if (c > maxCount) { maxCount = c; mostConsistent = p; }
    if (c < minCount) { minCount = c; mostMissed = p; }
  }

  return {
    weekly: Object.fromEntries(FARD.map(p => [p, weekly[p] ?? 0])),
    monthly: Object.fromEntries(FARD.map(p => [p, monthly[p] ?? 0])),
    weeklyPct: Math.min(100, Math.round((weekTotal / 35) * 100)),
    monthlyPct: Math.min(100, Math.round((monthTotal / 150) * 100)),
    currentStreak: streak,
    mostConsistent,
    mostMissed,
    totalLogged,
  };
}

statsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const logs = await fetchPrayerLogs(req.userId!);
    const stats = computeStats(logs);
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
