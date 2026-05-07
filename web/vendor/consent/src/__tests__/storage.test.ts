import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CURRENT_CONSENT_VERSION,
  STORAGE_KEY,
  buildAcceptAllRecord,
  buildConsentRecord,
  buildRejectNonEssentialRecord,
  clearConsent,
  readConsent,
  shouldRePrompt,
  writeConsent,
} from '../storage.js'
import type { ConsentRecord } from '../types.js'

const mockStorage: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  removeItem: (key: string) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]) },
  get length() { return Object.keys(mockStorage).length },
  key: (index: number) => Object.keys(mockStorage)[index] ?? null,
}

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('window', { localStorage: localStorageMock })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('readConsent', () => {
  it('returns null when no record is stored', () => {
    expect(readConsent()).toBeNull()
  })

  it('returns null on malformed JSON', () => {
    localStorageMock.setItem(STORAGE_KEY, 'not-json')
    expect(readConsent()).toBeNull()
  })

  it('returns null for an old version (re-prompt required)', () => {
    const old: ConsentRecord = {
      version: '1',
      timestamp: Date.now(),
      categories: { analytics: true, marketing: true, functional: true },
      doNotTrack: false,
      doNotSell: false,
      explicit: true,
    }
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(old))
    expect(readConsent()).toBeNull()
  })

  it('returns a valid record at the current version', () => {
    const record = buildAcceptAllRecord()
    writeConsent(record)
    expect(readConsent()).toMatchObject({
      version: CURRENT_CONSENT_VERSION,
      categories: { analytics: true, marketing: true, functional: true },
    })
  })
})

describe('writeConsent', () => {
  it('persists a record to localStorage', () => {
    const record = buildAcceptAllRecord()
    writeConsent(record)
    const raw = localStorageMock.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.version).toBe(CURRENT_CONSENT_VERSION)
  })
})

describe('clearConsent', () => {
  it('removes the stored record', () => {
    writeConsent(buildAcceptAllRecord())
    expect(readConsent()).not.toBeNull()
    clearConsent()
    expect(readConsent()).toBeNull()
  })
})

describe('buildAcceptAllRecord', () => {
  it('sets all categories to true', () => {
    const r = buildAcceptAllRecord()
    expect(r.categories).toEqual({ analytics: true, marketing: true, functional: true })
    expect(r.explicit).toBe(true)
    expect(r.version).toBe(CURRENT_CONSENT_VERSION)
  })
})

describe('buildRejectNonEssentialRecord', () => {
  it('sets all non-essential categories to false', () => {
    const r = buildRejectNonEssentialRecord()
    expect(r.categories).toEqual({ analytics: false, marketing: false, functional: false })
    expect(r.explicit).toBe(true)
  })
})

describe('buildConsentRecord — partial selection', () => {
  it('records an explicit partial selection', () => {
    const r = buildConsentRecord({ analytics: true, marketing: false, functional: true })
    expect(r.categories.analytics).toBe(true)
    expect(r.categories.marketing).toBe(false)
    expect(r.categories.functional).toBe(true)
    expect(r.explicit).toBe(true)
  })
})

describe('shouldRePrompt', () => {
  it('returns true when there is no record', () => {
    expect(shouldRePrompt(null)).toBe(true)
  })

  it('returns true when the version mismatches', () => {
    const old: ConsentRecord = {
      version: '0',
      timestamp: Date.now(),
      categories: { analytics: true, marketing: true, functional: true },
      doNotTrack: false,
      doNotSell: false,
      explicit: true,
    }
    expect(shouldRePrompt(old)).toBe(true)
  })

  it('returns false for a current-version record', () => {
    const r = buildAcceptAllRecord()
    expect(shouldRePrompt(r)).toBe(false)
  })
})

describe('doNotTrack flag', () => {
  it('is propagated when passed', () => {
    const r = buildRejectNonEssentialRecord({ doNotTrack: true })
    expect(r.doNotTrack).toBe(true)
  })

  it('defaults to false when not passed', () => {
    const r = buildAcceptAllRecord()
    expect(r.doNotTrack).toBe(false)
  })
})
