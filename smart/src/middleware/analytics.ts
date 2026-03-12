// analytics.ts — session analytics middleware
// Records web visitor sessions to pc_sessions table via Hasura GraphQL

import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

const SESSION_COOKIE = 'pc_session';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

// Generate or retrieve session ID from cookie
function getSessionId(req: Request, res: Response): string {
  const existing = (req as any).cookies?.[SESSION_COOKIE] as string | undefined;
  if (existing) return existing;
  const newId = createHash('sha256')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex')
    .slice(0, 16);
  res.cookie(SESSION_COOKIE, newId, {
    maxAge: SESSION_TTL_MS,
    httpOnly: true,
    sameSite: 'lax',
  });
  return newId;
}

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.IP_SALT ?? 'pc-salt'))
    .digest('hex');
}

async function insertSession(
  sessionId: string,
  ipHash: string,
  userAgent: string,
  path: string,
  durationMs: number
): Promise<void> {
  await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: `mutation InsertPcSession(
        $sessionId: String!
        $ipHash: String!
        $userAgent: String
        $path: String!
        $durationMs: Int
      ) {
        insert_pc_sessions_one(object: {
          session_id: $sessionId
          ip_hash: $ipHash
          user_agent: $userAgent
          path: $path
          duration_ms: $durationMs
        }) {
          id
        }
      }`,
      variables: {
        sessionId,
        ipHash,
        userAgent: userAgent.slice(0, 500),
        path,
        durationMs,
      },
    }),
  });
}

export function analyticsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only track web page requests, not API calls
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }

  const sessionId = getSessionId(req, res);
  const ipRaw = ((req.headers['x-forwarded-for'] as string) ?? '').split(',')[0].trim()
    || req.ip
    || '';
  const ipHash = hashIp(ipRaw);
  const userAgent = (req.headers['user-agent'] as string) ?? '';
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    // Fire-and-forget — never block the response
    insertSession(sessionId, ipHash, userAgent, req.path, duration).catch(() => {});
  });

  next();
}
