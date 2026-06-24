/**
 * FILE: packages/brand/src/tokens/colors.test.ts
 * PURPOSE: Lock canonical green hex values. Any change here requires PPI brand update.
 * REF: T-P7-C-S10-01
 */
import { describe, it, expect } from 'vitest'
import { green, semantic } from './colors'

describe('canonical green palette', () => {
  it('matches PPI-locked hex values', () => {
    expect(green[100]).toBe('#C9F27A')
    expect(green[400]).toBe('#79C24C')
    expect(green[500]).toBe('#5A9438')
    expect(green[700]).toBe('#1E5E2F')
    expect(green[900]).toBe('#0D2F17')
  })
  it('semantic.brand maps to canonical mid green', () => {
    expect(semantic.brand).toBe('#79C24C')
  })
  it('semantic.brandOnLight maps to AA-contrast variant', () => {
    expect(semantic.brandOnLight).toBe('#5A9438')
  })
})
