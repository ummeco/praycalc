/**
 * Purpose: Rate-us prompt gate — asks for a native App Store / Play Store review
 *   at a natural success moment (after logging a few prayers), never nags, and
 *   never asks again once StoreReview has been requested.
 * Inputs: A persisted MMKV counter of "success" events (prayer completions) and
 *   a persisted "already asked" flag.
 * Outputs: maybeRequestReview() — fires StoreReview.requestReview() at most once
 *   ever, only after the threshold is crossed, only when the OS API is available.
 * Constraints: Never call requestReview() more than once per install (Apple/Google
 *   guidelines + StoreReview.isAvailableAsync() rate-limits anyway, but we also
 *   self-gate so we don't even attempt it repeatedly). Pure gate logic
 *   (shouldRequestReview) is exported separately so it's unit-testable without
 *   mocking the native module.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-review
 */

import * as StoreReview from 'expo-store-review';
import { mmkv } from './storage/mmkv';

const STORAGE_KEY_SUCCESS_COUNT = 'pc:review:successCount';
const STORAGE_KEY_ALREADY_ASKED = 'pc:review:alreadyAsked';

/** Number of "success" events (prayers logged) before we consider prompting. */
export const REVIEW_SUCCESS_THRESHOLD = 6;

/**
 * Pure decision function — given the current success count and whether we've
 * already asked, decide whether this event should trigger a review prompt.
 * Exported for unit testing without touching MMKV or the native module.
 */
export function shouldRequestReview(successCount: number, alreadyAsked: boolean): boolean {
  if (alreadyAsked) return false;
  return successCount >= REVIEW_SUCCESS_THRESHOLD;
}

/** Read the current persisted success count (0 if never incremented). */
export function getReviewSuccessCount(): number {
  const raw = mmkv.getString(STORAGE_KEY_SUCCESS_COUNT);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function setReviewSuccessCount(n: number): void {
  mmkv.set(STORAGE_KEY_SUCCESS_COUNT, String(n));
}

export function hasAlreadyAskedForReview(): boolean {
  return mmkv.getBoolean(STORAGE_KEY_ALREADY_ASKED) ?? false;
}

function markAlreadyAsked(): void {
  mmkv.set(STORAGE_KEY_ALREADY_ASKED, true);
}

/**
 * Record a "success" event (e.g. a prayer was marked complete) and, if the
 * gate says so, request a native review. Safe to call from any success moment —
 * it no-ops once alreadyAsked is set or StoreReview is unavailable on this device.
 */
export async function recordSuccessAndMaybeRequestReview(): Promise<void> {
  const nextCount = getReviewSuccessCount() + 1;
  setReviewSuccessCount(nextCount);

  if (!shouldRequestReview(nextCount, hasAlreadyAskedForReview())) return;

  const available = await StoreReview.isAvailableAsync();
  if (!available) return;

  // Mark asked BEFORE requesting — requestReview() never rejects in a way we can
  // act on (the OS may silently no-op due to its own rate limit), so "asked" means
  // "we made the attempt", matching Apple/Google's one-shot guidance.
  markAlreadyAsked();
  await StoreReview.requestReview();
}

/** Test/debug helper — resets the gate so QA can re-trigger the prompt. Never
 *  called from production code paths. */
export function resetReviewGateForTesting(): void {
  mmkv.delete(STORAGE_KEY_SUCCESS_COUNT);
  mmkv.delete(STORAGE_KEY_ALREADY_ASKED);
}
