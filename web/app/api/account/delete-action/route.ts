/**
 * POST /api/account/delete-action
 *
 * S6-05 — Hasura action handler for delete_user_account.
 *
 * This route is called by Hasura (NOT directly by the client).
 * Hasura calls this after the user-role permission check passes.
 *
 * It validates the Remote Schema secret header, then calls the
 * pc_soft_delete_user Postgres function via the admin GraphQL endpoint
 * to soft-delete the user's PrayCalc data.
 *
 * The /api/account/delete client-facing route (S6-04) is the entry
 * point for the user — it verifies Turnstile + auth session, then
 * invokes the delete_user_account Hasura action which calls this handler.
 *
 * Hasura action spec:
 *   delete_user_account(userId: uuid!): { success: Boolean! }
 *
 * Auth: x-remote-schema-secret header (same secret used for Remote Schema)
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DeleteActionSchema = z.object({
  action:            z.object({ name: z.string().optional() }).optional(),
  input:             z.object({ userId: z.string().uuid() }),
  session_variables: z.record(z.string()).optional(),
});

const HASURA_ADMIN_URL =
  process.env.HASURA_ADMIN_URL || "https://api.ummat.dev/v1/graphql";
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || "";
const REMOTE_SCHEMA_SECRET = process.env.REMOTE_SCHEMA_SECRET || "";

// GraphQL mutation that calls the backing Postgres function
const SOFT_DELETE_MUTATION = `
  mutation SoftDeleteUser($userId: uuid!) {
    delete_pc_users(where: { id: { _eq: $userId } }) {
      affected_rows
    }
    update_pc_users(
      where: { id: { _eq: $userId } }
      _set: { deleted_at: "now()" }
    ) {
      affected_rows
    }
  }
`;

// Direct SQL via Hasura run_sql API (more reliable for the SECURITY DEFINER fn)
const RUN_SQL_ENDPOINT = HASURA_ADMIN_URL.replace(
  /\/v1\/graphql$/,
  "/v2/query"
);

async function softDeleteUser(userId: string): Promise<boolean> {
  const resp = await fetch(RUN_SQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `SELECT pc_soft_delete_user($1::uuid)`,
        args: [userId],
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Hasura run_sql failed (${resp.status}): ${text}`);
  }

  const json = (await resp.json()) as {
    result?: [string[], [string][]];
    error?: string;
  };

  if (json.error) {
    throw new Error(`Hasura SQL error: ${json.error}`);
  }

  // result is [["pc_soft_delete_user"], [["t"]] | [["f"]]]
  const rows = json.result?.[1];
  return rows?.[0]?.[0] === "t";
}

export async function POST(req: NextRequest) {
  // Validate action secret (Hasura sends this header when calling action handlers)
  const secret = req.headers.get("x-remote-schema-secret") || "";
  if (REMOTE_SCHEMA_SECRET && secret !== REMOTE_SCHEMA_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Hasura action request body format:
  // { action: { name }, input: { userId }, session_variables: { "x-hasura-user-id": ... } }
  const rawBody = await req.json().catch(() => null);
  const parsed = DeleteActionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const userId = parsed.data.input.userId;
  const sessionUserId = parsed.data.session_variables?.["x-hasura-user-id"];

  // Security: the user may only delete their own account.
  // Hasura enforces user-role permission; we double-check here.
  if (sessionUserId && sessionUserId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const deleted = await softDeleteUser(userId);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    Sentry.captureException(err);
    console.error("[account/delete-action] Error:", err);
    return NextResponse.json(
      { error: "Delete failed — contact support" },
      { status: 500 }
    );
  }
}
