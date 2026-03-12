/**
 * Dev-only login endpoint. Looks up the owner account via Hasura admin API
 * and mints a JWT signed with the local JWT secret (matching the smart server).
 * Always bypasses Hasura Auth sign-in/sign-up so the token is always valid
 * for the local smart server regardless of prod auth config.
 *
 * Only active when NODE_ENV=development. Returns 404 in production.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const DEV_OWNER_EMAIL = 'alisalaah@gmail.com';
const DEV_OWNER_NAME = 'Ali Salaah';

const HASURA_ADMIN_URL =
  process.env.HASURA_ADMIN_URL ??
  process.env.NEXT_PUBLIC_HASURA_URL ??
  'https://api.ummat.dev/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? '';
// Must match HASURA_GRAPHQL_JWT_SECRET key in smart/.env.local
const JWT_SECRET = process.env.HASURA_JWT_KEY ?? 'e103127b6e52cd5a4f167ecf2b9272e22784c989e901a14d4b60304bfbc98c84';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
        { status: 500, headers: corsHeaders },
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
    }, { headers: corsHeaders });
  } catch (err) {
    console.error('[dev/login]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
}
