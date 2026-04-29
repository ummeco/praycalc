/**
 * Dev-only login endpoint. Looks up the owner account via Hasura admin API
 * and mints a JWT signed with the local JWT secret (matching the smart server).
 * Always bypasses Hasura Auth sign-in/sign-up so the token is always valid
 * for the local smart server regardless of prod auth config.
 *
 * Only active when NODE_ENV=development. Returns 404 in production.
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DEV_OWNER_EMAIL = 'alisalaah@gmail.com';
const DEV_OWNER_NAME = 'Ali Salaah';

const HASURA_ADMIN_URL =
  process.env.HASURA_ADMIN_URL ??
  process.env.NEXT_PUBLIC_HASURA_URL ??
  'https://api.ummat.dev/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? '';
// Must match HASURA_GRAPHQL_JWT_SECRET key in smart/.env.local — required, no fallback.
const JWT_SECRET = process.env.HASURA_JWT_KEY ?? '';

// Dev-only endpoint — returns 404 in production (see NODE_ENV check in POST).
// CORS is scoped to local dev origins even here for defence-in-depth.
const DEV_CORS_ORIGINS = [
  'https://www.praycalc.local.nself.org:8543',
  'http://localhost:3041',
]

function devCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && DEV_CORS_ORIGINS.includes(origin) ? origin : DEV_CORS_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new Response(null, { status: 204, headers: devCorsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const cors = devCorsHeaders(origin)

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: 'HASURA_JWT_KEY not set in web/.env.local — cannot mint dev JWT' },
      { status: 500, headers: cors },
    );
  }

  try {
    // Query user via Hasura admin API.
    const gqlRes = await fetch(HASURA_ADMIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `{ users(where:{email:{_eq:"${DEV_OWNER_EMAIL}"}}) { id email displayName } }`,
      }),
    });

    const gqlData = await gqlRes.json();
    const user = gqlData?.data?.users?.[0];

    if (!user) {
      return NextResponse.json(
        {
          error: `Dev account not found. Admin query HTTP ${gqlRes.status}. Response: ${JSON.stringify(gqlData)}. Make sure HASURA_GRAPHQL_ADMIN_SECRET is set correctly in web/.env.local.`,
        },
        { status: 500, headers: cors },
      );
    }

    // Mint a JWT signed with the local secret — always matches the smart server.
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 8 * 60 * 60; // 8 hours

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: user.id,
      iat: now,
      exp,
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': ['user', 'me'],
        'x-hasura-default-role': 'user',
        'x-hasura-user-id': user.id,
      },
    })).toString('base64url');
    const sig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    const accessToken = `${header}.${payload}.${sig}`;

    // Fake refresh token — refresh will fail gracefully (8h token is long enough for dev).
    const fakeRefreshToken = crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      session: {
        accessToken,
        accessTokenExpiresIn: 28800,
        refreshToken: fakeRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName || DEV_OWNER_NAME,
          avatarUrl: null,
        },
      },
    }, { headers: cors });
  } catch (err) {
    Sentry.captureException(err);
    console.error('[dev/login]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: cors });
  }
}
