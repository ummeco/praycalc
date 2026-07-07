/**
 * Purpose: Verify the special-day banner ALLOWLIST and the "Tomorrow is Arafah" day-before
 *   math, plus Ramadan "Day X of Y" progress. Dates are exact Gregorian dates whose
 *   Umm al-Qura (gregorianToHijri) conversion lands on the target Hijri day, so the test
 *   is self-consistent with the module's own calendar.
 * CONTENT-GATE ASSERTION: Mawlid al-Nabi (and every non-allowlisted event) must NEVER
 *   produce a banner — that exclusion is a deliberate content decision.
 * SPORT: praycalc/tv lib/events tests
 */

import { getSpecialDay, getRamadanProgress } from '../specialDays';

// Exact Gregorian dates → target Hijri days (verified via @umalqura/core scan).
const RAMADAN_START = new Date(2027, 1, 8); // 1 Ramadan
const MID_RAMADAN = new Date(2027, 1, 22); // 15 Ramadan (29-day month)
const EID_FITR = new Date(2027, 2, 9); // 1 Shawwal
const EID_ADHA = new Date(2027, 4, 16); // 10 Dhu al-Hijjah
const ARAFAH = new Date(2027, 4, 15); // 9 Dhu al-Hijjah
const ARAFAH_EVE = new Date(2027, 4, 14); // 8 Dhu al-Hijjah (tomorrow = Arafah)
const MAWLID = new Date(2026, 7, 25); // 12 Rabi' al-Awwal — INTENTIONALLY EXCLUDED
const ORDINARY = new Date(2026, 6, 7); // 22 Muharram — no banner

describe('getSpecialDay — allowlist', () => {
  it('shows "Ramadan Mubarak" on 1 Ramadan', () => {
    const day = getSpecialDay(RAMADAN_START);
    expect(day?.id).toBe('ramadan-start');
    expect(day?.title).toBe('Ramadan Mubarak');
  });

  it('shows "Eid Mubarak" on Eid al-Fitr (1 Shawwal)', () => {
    const day = getSpecialDay(EID_FITR);
    expect(day?.id).toBe('eid-al-fitr');
    expect(day?.title).toBe('Eid Mubarak');
    expect(day?.subtitle).toBe('Eid al-Fitr');
  });

  it('shows "Eid Mubarak" on Eid al-Adha (10 Dhu al-Hijjah)', () => {
    const day = getSpecialDay(EID_ADHA);
    expect(day?.id).toBe('eid-al-adha');
    expect(day?.title).toBe('Eid Mubarak');
    expect(day?.subtitle).toBe('Eid al-Adha');
  });

  it('shows "Day of Arafah" on 9 Dhu al-Hijjah', () => {
    const day = getSpecialDay(ARAFAH);
    expect(day?.id).toBe('arafah');
    expect(day?.title).toBe('Day of Arafah');
  });

  it('shows "Tomorrow is Arafah" the day before Arafah (8 Dhu al-Hijjah)', () => {
    const day = getSpecialDay(ARAFAH_EVE);
    expect(day?.id).toBe('arafah-eve');
    expect(day?.title).toBe('Tomorrow is Arafah');
  });

  it('EXCLUDES Mawlid al-Nabi — no banner (deliberate content-gate)', () => {
    expect(getSpecialDay(MAWLID)).toBeNull();
  });

  it('shows no banner on an ordinary day', () => {
    expect(getSpecialDay(ORDINARY)).toBeNull();
  });

  it('mid-Ramadan is NOT a banner day (only the 1st is allowlisted)', () => {
    expect(getSpecialDay(MID_RAMADAN)).toBeNull();
  });
});

describe('getRamadanProgress', () => {
  it('returns Day 1 of 29 on the first of a 29-day Ramadan', () => {
    expect(getRamadanProgress(RAMADAN_START)).toEqual({ day: 1, total: 29 });
  });

  it('returns Day 15 of 29 at mid-Ramadan', () => {
    expect(getRamadanProgress(MID_RAMADAN)).toEqual({ day: 15, total: 29 });
  });

  it('returns null outside Ramadan', () => {
    expect(getRamadanProgress(ORDINARY)).toBeNull();
    expect(getRamadanProgress(EID_FITR)).toBeNull();
  });
});
