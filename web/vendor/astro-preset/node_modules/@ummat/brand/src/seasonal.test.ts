/**
 * FILE: packages/brand/src/seasonal.test.ts
 * PURPOSE: Unit tests for getActiveTheme. Boundary days + middle of each window + default.
 * REF: T-P7-C-S10-T07 acceptance ("8+ Hijri dates return expected theme")
 */
import { describe, it, expect } from 'vitest'
import { getActiveTheme } from './seasonal'
import { getTheme, themes } from './themes'

describe('getActiveTheme — seasonal window resolution', () => {
  it('returns muharram on Muharram 1 (lower boundary)', () => {
    expect(getActiveTheme({ year: 1447, month: 1, day: 1 })).toBe('muharram')
  })
  it('returns muharram on Muharram 10 (Ashura, upper boundary)', () => {
    expect(getActiveTheme({ year: 1447, month: 1, day: 10 })).toBe('muharram')
  })
  it('returns default on Muharram 11 (just past)', () => {
    expect(getActiveTheme({ year: 1447, month: 1, day: 11 })).toBe('default')
  })
  it('returns ramadan on Ramadan 1', () => {
    expect(getActiveTheme({ year: 1447, month: 9, day: 1 })).toBe('ramadan')
  })
  it('returns ramadan mid-month (Ramadan 15)', () => {
    expect(getActiveTheme({ year: 1447, month: 9, day: 15 })).toBe('ramadan')
  })
  it('returns ramadan on Ramadan 29 (upper boundary)', () => {
    expect(getActiveTheme({ year: 1447, month: 9, day: 29 })).toBe('ramadan')
  })
  it('returns eid on Shawwal 1 (Eid ul-Fitr)', () => {
    expect(getActiveTheme({ year: 1447, month: 10, day: 1 })).toBe('eid')
  })
  it('returns eid on Shawwal 3 (upper boundary)', () => {
    expect(getActiveTheme({ year: 1447, month: 10, day: 3 })).toBe('eid')
  })
  it('returns default on Shawwal 4 (just past Eid window)', () => {
    expect(getActiveTheme({ year: 1447, month: 10, day: 4 })).toBe('default')
  })
  it('returns dhul-hijjah on Dhul Hijjah 1', () => {
    expect(getActiveTheme({ year: 1447, month: 12, day: 1 })).toBe('dhul-hijjah')
  })
  it('returns dhul-hijjah on Dhul Hijjah 10 (Eid ul-Adha)', () => {
    expect(getActiveTheme({ year: 1447, month: 12, day: 10 })).toBe('dhul-hijjah')
  })
  it('returns dhul-hijjah on Dhul Hijjah 13 (upper boundary)', () => {
    expect(getActiveTheme({ year: 1447, month: 12, day: 13 })).toBe('dhul-hijjah')
  })
  it('returns default on Rabi al-Awwal 12 (out-of-window)', () => {
    expect(getActiveTheme({ year: 1447, month: 3, day: 12 })).toBe('default')
  })
})

describe('getTheme — lookup + fallback', () => {
  it('resolves known names', () => {
    expect(getTheme('ramadan')).toBe(themes.ramadan)
    expect(getTheme('eid')).toBe(themes.eid)
    expect(getTheme('muharram')).toBe(themes.muharram)
    expect(getTheme('dhul-hijjah')).toBe(themes['dhul-hijjah'])
  })
  it('falls back to default on null/undefined/empty', () => {
    expect(getTheme(null)).toBe(themes.default)
    expect(getTheme(undefined)).toBe(themes.default)
    expect(getTheme('')).toBe(themes.default)
  })
  it('falls back to default on unknown', () => {
    expect(getTheme('not-a-theme')).toBe(themes.default)
  })
})
