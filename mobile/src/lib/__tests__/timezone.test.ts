/**
 * Purpose: Regression tests for resolveTimezoneOffset — the fix for the bug where
 *   parseFloat(ianaString) silently returned NaN for any location whose timezone field
 *   was an IANA zone name (e.g. GPS-based flows via Intl.DateTimeFormat().resolvedOptions()
 *   .timeZone), treating the whole world as UTC+0.
 * Constraints: DST behavior must be verified against a real DST-observing IANA zone
 *   (Europe/London: GMT in January, BST/+1 in July) — a fixed-offset zone alone wouldn't
 *   catch a regression to a naive parseFloat-only implementation.
 */

import { resolveTimezoneOffset } from '../timezone';

describe('resolveTimezoneOffset', () => {
  it('resolves Europe/London to 0 in January (GMT, no DST)', () => {
    const januaryDate = new Date('2026-01-15T12:00:00Z');
    expect(resolveTimezoneOffset('Europe/London', januaryDate)).toBe(0);
  });

  it('resolves Europe/London to 1 in July (BST, DST in effect)', () => {
    const julyDate = new Date('2026-07-15T12:00:00Z');
    expect(resolveTimezoneOffset('Europe/London', julyDate)).toBe(1);
  });

  it('resolves a numeric offset string year-round regardless of date', () => {
    const januaryDate = new Date('2026-01-15T12:00:00Z');
    const julyDate = new Date('2026-07-15T12:00:00Z');
    expect(resolveTimezoneOffset('+3', januaryDate)).toBe(3);
    expect(resolveTimezoneOffset('+3', julyDate)).toBe(3);
  });

  it('resolves a negative numeric offset string', () => {
    expect(resolveTimezoneOffset('-5', new Date('2026-01-15T12:00:00Z'))).toBe(-5);
  });

  it('resolves a fractional numeric offset string (e.g. Iran +3.5)', () => {
    expect(resolveTimezoneOffset('+3.5', new Date('2026-01-15T12:00:00Z'))).toBe(3.5);
  });

  it('returns 0 for undefined input (documented fallback, not a crash)', () => {
    expect(resolveTimezoneOffset(undefined, new Date('2026-01-15T12:00:00Z'))).toBe(0);
  });

  it('returns 0 for an empty string (documented fallback, not a crash)', () => {
    expect(resolveTimezoneOffset('', new Date('2026-01-15T12:00:00Z'))).toBe(0);
  });

  it('returns 0 for a garbage/unrecognized IANA-shaped string (documented fallback via the internal try/catch)', () => {
    expect(resolveTimezoneOffset('Not/ARealZone', new Date('2026-01-15T12:00:00Z'))).toBe(0);
  });

  it('defaults the reference date to now when omitted', () => {
    // Just verify it does not throw and returns a finite number.
    const result = resolveTimezoneOffset('Europe/London');
    expect(Number.isFinite(result)).toBe(true);
  });
});
