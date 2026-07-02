import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { hasUmmatPlus } from '../lib/subscription.js';

// HASURA_GRAPHQL_JWT_SECRET may be:
//   1. Valid JSON:   {"type":"HS256","key":"<hex>"}
//   2. Bash-mangled: {type:HS256,key:<hex>}  (shell source strips inner quotes)
//   3. Raw string:   <hex>
function parseJwtSecret(raw: string): string {
  if (!raw) return raw;
  // 1. Try valid JSON first
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.key === 'string') return parsed.key;
  } catch { /* not valid JSON */ }
  // 2. Handle bash-mangled format — extract key:<value> with regex
  const keyMatch = raw.match(/key[=:]\s*([a-zA-Z0-9._~+/=\-]{16,})/);
  if (keyMatch?.[1]) return keyMatch[1];
  // 3. Raw string
  return raw;
}

const HASURA_JWT_SECRET = parseJwtSecret(process.env.HASURA_GRAPHQL_JWT_SECRET || '');

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;
}

/** Extract and validate JWT from Authorization header. Non-blocking: sets userId if valid. */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.isAuthenticated = false;
    next();
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, HASURA_JWT_SECRET) as any;
    const claims = decoded['https://hasura.io/jwt/claims'] || {};
    req.userId = claims['x-hasura-user-id'];
    req.userRole = claims['x-hasura-default-role'] || 'user';
    req.isAuthenticated = true;
  } catch (err) {
    // JWT invalid or expired — treat as unauthenticated (expected for bad tokens).
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] JWT verification failed:', (err as Error).message);
    }
    req.isAuthenticated = false;
  }
  next();
}

/** Require valid JWT. Returns 401 if missing/invalid. */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  optionalAuth(req, res, () => {
    if (!req.isAuthenticated || !req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  });
}

/**
 * Require an active Ummat+ subscription. Must run AFTER requireAuth (relies on
 * req.userId already being set). Returns 402 Payment Required if the user is
 * not Plus — this is the server-side gate for smart-home account linking
 * (Google Home / Alexa OAuth) and TV device/token issuance: "Plus unlocks TV".
 * Fails closed: any subscription-lookup error is treated as not-Plus (see
 * hasUmmatPlus / getSubscriptionStatus fail-open-to-free behavior in
 * subscription.ts — free is the safe default for a paywall check).
 */
export async function requirePlus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.isAuthenticated || !req.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const isPlus = await hasUmmatPlus(req.userId);
  if (!isPlus) {
    res.status(402).json({
      error: 'ummat_plus_required',
      upgrade: 'https://praycalc.com/upgrade',
    });
    return;
  }

  next();
}
