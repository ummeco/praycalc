import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const HASURA_JWT_SECRET = process.env.HASURA_GRAPHQL_JWT_SECRET || '';

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
  } catch {
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
