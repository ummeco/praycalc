import { Router } from 'express';
import crypto from 'crypto';

export const oauthRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';
const HASURA_AUTH_URL = process.env.HASURA_AUTH_URL || 'http://auth:4000';

/** Hash a token for storage (never store raw tokens in the database). */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Execute a Hasura GraphQL query with admin secret. */
async function hasuraQuery(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const response = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

/**
 * GET /oauth/authorize — OAuth 2.0 Authorization Endpoint.
 * Used by Google Actions and Alexa for account linking.
 * Shows consent screen, validates user, returns authorization code.
 */
oauthRouter.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, state, response_type, code_challenge, code_challenge_method } = req.query;

  if (response_type !== 'code') {
    res.status(400).json({ error: 'unsupported_response_type' });
    return;
  }

  // Render a simple consent page (in production: SSR React page)
  res.send(`<!DOCTYPE html>
<html>
<head><title>PrayCalc - Link Account</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui; max-width: 400px; margin: 40px auto; padding: 20px; background: #0D2F17; color: #fff; }
  h1 { color: #C9F27A; }
  form { display: flex; flex-direction: column; gap: 12px; }
  input { padding: 12px; border-radius: 8px; border: 1px solid #333; background: #1a1a1a; color: #fff; font-size: 16px; }
  button { padding: 14px; border-radius: 8px; border: none; background: #79C24C; color: #0D2F17; font-weight: bold; font-size: 16px; cursor: pointer; }
  button:hover { background: #C9F27A; }
  .info { color: #aaa; font-size: 14px; }
</style>
</head>
<body>
  <h1>Link PrayCalc</h1>
  <p class="info">Sign in to connect your PrayCalc account with your smart home device.</p>
  <form method="POST" action="/oauth/authorize">
    <input type="hidden" name="client_id" value="${client_id}">
    <input type="hidden" name="redirect_uri" value="${redirect_uri}">
    <input type="hidden" name="state" value="${state}">
    <input type="hidden" name="code_challenge" value="${code_challenge || ''}">
    <input type="hidden" name="code_challenge_method" value="${code_challenge_method || ''}">
    <input type="email" name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Link Account</button>
  </form>
</body>
</html>`);
});

/** POST /oauth/authorize — Process login and issue authorization code. */
oauthRouter.post('/authorize', async (req, res) => {
  const { email, password, client_id, redirect_uri, state, code_challenge } = req.body;

  // Authenticate via Hasura Auth
  try {
    const authResponse = await fetch(`${HASURA_AUTH_URL}/signin/email-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      res.status(401).send('Invalid email or password. <a href="javascript:history.back()">Try again</a>');
      return;
    }

    const authData = await authResponse.json() as any;
    const userId = authData?.session?.user?.id;

    if (!userId) {
      res.status(500).send('Authentication error');
      return;
    }

    // Generate authorization code and persist to database
    const code = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await hasuraQuery(
      `mutation InsertOAuthCode($code: String!, $userId: uuid!, $clientId: String!, $codeChallenge: String, $expiresAt: timestamptz!) {
        insert_pc_oauth_codes_one(object: {
          code: $code
          user_id: $userId
          client_id: $clientId
          code_challenge: $codeChallenge
          expires_at: $expiresAt
        }) { code }
      }`,
      { code, userId, clientId: client_id, codeChallenge: code_challenge || null, expiresAt },
    );

    // Redirect back to platform with code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (state) redirectUrl.searchParams.set('state', state);
    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('[OAUTH] Auth error:', err);
    res.status(500).send('Authentication service unavailable');
  }
});

/** POST /oauth/token — Exchange authorization code for access token. */
oauthRouter.post('/token', async (req, res) => {
  const { grant_type, code, refresh_token, client_id } = req.body;

  if (grant_type === 'authorization_code') {
    // Look up auth code from database
    const codeResult = await hasuraQuery(
      `query GetOAuthCode($code: String!) {
        pc_oauth_codes_by_pk(code: $code) {
          user_id
          client_id
          expires_at
        }
      }`,
      { code },
    );

    const authCode = codeResult?.data?.pc_oauth_codes_by_pk;
    if (!authCode || new Date(authCode.expires_at) < new Date()) {
      res.status(400).json({ error: 'invalid_grant' });
      return;
    }

    // Delete used code
    await hasuraQuery(
      `mutation DeleteOAuthCode($code: String!) {
        delete_pc_oauth_codes_by_pk(code: $code) { code }
      }`,
      { code },
    );

    // Generate access + refresh tokens, store hashed in DB
    const accessToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenValue = crypto.randomBytes(48).toString('hex');
    const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await hasuraQuery(
      `mutation InsertOAuthTokens($objects: [pc_oauth_tokens_insert_input!]!) {
        insert_pc_oauth_tokens(objects: $objects) { affected_rows }
      }`,
      {
        objects: [
          { token_hash: hashToken(accessToken), user_id: authCode.user_id, token_type: 'access', expires_at: accessExpiresAt },
          { token_hash: hashToken(refreshTokenValue), user_id: authCode.user_id, token_type: 'refresh', expires_at: refreshExpiresAt },
        ],
      },
    );

    res.json({
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      token_type: 'Bearer',
      expires_in: 3600,
    });
    return;
  }

  if (grant_type === 'refresh_token') {
    const tokenHash = hashToken(refresh_token);
    const tokenResult = await hasuraQuery(
      `query GetOAuthToken($tokenHash: String!) {
        pc_oauth_tokens_by_pk(token_hash: $tokenHash) {
          user_id
          token_type
          expires_at
          revoked
        }
      }`,
      { tokenHash },
    );

    const stored = tokenResult?.data?.pc_oauth_tokens_by_pk;
    if (!stored || stored.revoked || stored.token_type !== 'refresh' || new Date(stored.expires_at) < new Date()) {
      res.status(400).json({ error: 'invalid_grant' });
      return;
    }

    // Issue new access token
    const newAccessToken = crypto.randomBytes(48).toString('hex');
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await hasuraQuery(
      `mutation InsertOAuthToken($tokenHash: String!, $userId: uuid!, $expiresAt: timestamptz!) {
        insert_pc_oauth_tokens_one(object: {
          token_hash: $tokenHash
          user_id: $userId
          token_type: "access"
          expires_at: $expiresAt
        }) { token_hash }
      }`,
      { tokenHash: hashToken(newAccessToken), userId: stored.user_id, expiresAt: newExpiresAt },
    );

    res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: 3600,
    });
    return;
  }

  res.status(400).json({ error: 'unsupported_grant_type' });
});

/** POST /oauth/revoke — Revoke a token. */
oauthRouter.post('/revoke', async (req, res) => {
  const { token } = req.body;
  if (token) {
    const tokenHash = hashToken(token);
    await hasuraQuery(
      `mutation RevokeOAuthToken($tokenHash: String!) {
        update_pc_oauth_tokens_by_pk(pk_columns: { token_hash: $tokenHash }, _set: { revoked: true }) { token_hash }
      }`,
      { tokenHash },
    );
  }
  res.status(200).json({ revoked: true });
});

/** Resolve userId from access token. Used by Google/Alexa fulfillment handlers. */
export async function resolveUserFromToken(accessToken: string): Promise<string | undefined> {
  const tokenHash = hashToken(accessToken);
  const result = await hasuraQuery(
    `query GetOAuthToken($tokenHash: String!) {
      pc_oauth_tokens_by_pk(token_hash: $tokenHash) {
        user_id
        expires_at
        revoked
      }
    }`,
    { tokenHash },
  );

  const stored = result?.data?.pc_oauth_tokens_by_pk;
  if (!stored || stored.revoked || new Date(stored.expires_at) < new Date()) return undefined;
  return stored.user_id;
}
