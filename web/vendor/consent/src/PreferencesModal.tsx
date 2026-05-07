"use client"

import React, { useState } from 'react'
import type { PreferencesModalStrings } from './types.js'
import { useConsent } from './useConsent.js'
import { COOKIES } from './cookie-inventory.js'

const DEFAULT_STRINGS: Required<PreferencesModalStrings> = {
  title: 'Cookie Preferences',
  save: 'Save preferences',
  cancel: 'Cancel',
  strictlyNecessaryLabel: 'Strictly Necessary',
  strictlyNecessaryDesc:
    'Required for the site to function. These cannot be disabled.',
  functionalLabel: 'Functional',
  functionalDesc:
    'Remember your preferences (language, location, settings) so you do not have to re-enter them.',
  analyticsLabel: 'Analytics',
  analyticsDesc:
    'Help us understand how visitors use the site so we can improve it. All data is anonymised.',
  marketingLabel: 'Marketing',
  marketingDesc:
    'Allow third-party content (such as YouTube videos) and relevant advertising. Disabled by default.',
  alwaysOn: 'Always on',
}

export interface PreferencesModalProps {
  strings?: PreferencesModalStrings
  appSlug?: string
}

interface ToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onChange: (val: boolean) => void
  alwaysOnLabel: string
}

function Toggle({ id, label, description, checked, disabled, onChange, alwaysOnLabel }: ToggleProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-[#1E5E2F] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white mb-1">{label}</p>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 mt-0.5">
        {disabled ? (
          <span className="text-xs text-[#79C24C] font-medium">{alwaysOnLabel}</span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            id={id}
            onClick={() => onChange(!checked)}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]',
              checked ? 'bg-[#79C24C]' : 'bg-gray-600',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform',
                checked ? 'translate-x-6' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
        )}
      </div>
    </div>
  )
}

function CookieTable({ appSlug }: { appSlug?: string }) {
  const filtered = appSlug
    ? COOKIES.filter((c) => c.app === 'all' || c.app.startsWith('all') || c.app === appSlug)
    : COOKIES

  if (filtered.length === 0) return null

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="border-b border-[#1E5E2F]">
            <th className="pb-2 pr-4 text-gray-400 font-medium">Name</th>
            <th className="pb-2 pr-4 text-gray-400 font-medium">Category</th>
            <th className="pb-2 text-gray-400 font-medium">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={`${c.name}-${i}`} className="border-b border-[#0D2F17]">
              <td className="py-1.5 pr-4 text-gray-300 font-mono">{c.name}</td>
              <td className="py-1.5 pr-4 text-gray-400 capitalize">{c.category.replace('-', ' ')}</td>
              <td className="py-1.5 text-gray-400">{c.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PreferencesModal({ strings, appSlug }: PreferencesModalProps) {
  const { preferencesOpen, closePreferences, saveCategories, categories } = useConsent()
  const s = { ...DEFAULT_STRINGS, ...strings }

  const [draft, setDraft] = useState({
    analytics: categories.analytics,
    marketing: categories.marketing,
    functional: categories.functional,
  })

  if (!preferencesOpen) return null

  function handleSave() {
    saveCategories(draft)
  }

  function set(key: keyof typeof draft) {
    return (val: boolean) => setDraft((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closePreferences}
        aria-hidden="true"
      />

      <div className="relative bg-[#0D2F17] border border-[#1E5E2F] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E5E2F]">
          <h2 className="text-base font-semibold text-white">{s.title}</h2>
          <button
            type="button"
            onClick={closePreferences}
            aria-label="Close"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <Toggle
            id="toggle-strictly-necessary"
            label={s.strictlyNecessaryLabel}
            description={s.strictlyNecessaryDesc}
            checked
            disabled
            onChange={() => undefined}
            alwaysOnLabel={s.alwaysOn}
          />
          <Toggle
            id="toggle-functional"
            label={s.functionalLabel}
            description={s.functionalDesc}
            checked={draft.functional}
            disabled={false}
            onChange={set('functional')}
            alwaysOnLabel={s.alwaysOn}
          />
          <Toggle
            id="toggle-analytics"
            label={s.analyticsLabel}
            description={s.analyticsDesc}
            checked={draft.analytics}
            disabled={false}
            onChange={set('analytics')}
            alwaysOnLabel={s.alwaysOn}
          />
          <Toggle
            id="toggle-marketing"
            label={s.marketingLabel}
            description={s.marketingDesc}
            checked={draft.marketing}
            disabled={false}
            onChange={set('marketing')}
            alwaysOnLabel={s.alwaysOn}
          />

          <CookieTable appSlug={appSlug} />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1E5E2F]">
          <button
            type="button"
            onClick={closePreferences}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {s.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm rounded-md bg-[#79C24C] text-[#0D2F17] font-semibold hover:bg-[#C9F27A] transition-colors"
          >
            {s.save}
          </button>
        </div>
      </div>
    </div>
  )
}
