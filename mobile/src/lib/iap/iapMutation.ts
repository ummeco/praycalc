/**
 * Purpose: GraphQL mutation builder for recording a validated IAP purchase into
 *   pc_iap_receipts (account-mode users only — anonymous users never call this,
 *   per useAuthStore's zero-API-calls-when-anonymous constraint).
 * Inputs: orderId (SDK transaction identifier), productId, platform.
 * Outputs: { query, variables } ready for urql client.mutation().
 * Constraints: Column names are this app's documented intent (see SubscriptionScreen.tsx
 *   header: "Receipt stored in pc_iap_receipts with transaction_id + product_id + user_id")
 *   — pc_iap_receipts does not yet exist in any backend migration in this workspace, so
 *   this mutation is the client-side contract; confirm/create the matching Hasura table
 *   + permission (account JWT can only insert its own user_id) before this ships.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-iap-mutation
 */

export const RECORD_IAP_RECEIPT_MUTATION = `
  mutation RecordIapReceipt($transactionId: String!, $productId: String!, $platform: String!) {
    insert_pc_iap_receipts_one(
      object: { transaction_id: $transactionId, product_id: $productId, platform: $platform }
      on_conflict: { constraint: pc_iap_receipts_transaction_id_key, update_columns: [] }
    ) {
      transaction_id
      product_id
      user_id
    }
  }
`;

export interface RecordIapReceiptVariables {
  transactionId: string;
  productId: string;
  platform: 'ios' | 'android';
}

export function buildRecordIapReceiptRequest(vars: RecordIapReceiptVariables): {
  query: string;
  variables: RecordIapReceiptVariables;
} {
  return { query: RECORD_IAP_RECEIPT_MUTATION, variables: vars };
}
