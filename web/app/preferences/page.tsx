"use client"

/**
 * S05-08: /preferences — Consent management page (PrayCalc)
 * Location data is noted as sensitive personal info per CCPA (used for prayer times, Qibla).
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useConsent } from '@ummat/consent'

function ToggleRow({ id, label, description, checked, disabled = false, onChange }: {
  id: string; label: string; description: string
  checked: boolean; disabled?: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-white/10 last:border-0">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="block text-sm font-semibold text-[#C9F27A] mb-1 cursor-pointer">{label}</label>
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 mt-0.5">
        {disabled ? (
          <span className="text-xs text-[#5A9438] font-medium">Always on</span>
        ) : (
          <button type="button" role="switch" id={id} aria-checked={checked} aria-label={label}
            onClick={() => onChange(!checked)}
            className={['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9F27A]', checked ? 'bg-[#79C24C]' : 'bg-white/20'].join(' ')}>
            <span className="sr-only">{checked ? 'On' : 'Off'}</span>
            <span aria-hidden="true" className={['inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform', checked ? 'translate-x-6' : 'translate-x-1'].join(' ')} />
          </button>
        )}
      </div>
    </div>
  )
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t) }, [onDismiss])
  return <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-[#1E5E2F] border border-[#79C24C]/40 px-5 py-3 text-sm text-white shadow-xl">{message}</div>
}

export default function PreferencesPage() {
  const { record, saveCategories } = useConsent()
  const [draft, setDraft] = useState({ functional: false, analytics: false, marketing: false })
  const [saving, setSaving] = useState(false)
  const [unsubscribing, setUnsubscribing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [unsubErr, setUnsubErr] = useState<string | null>(null)
  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (record?.categories) {
      setDraft({ functional: record.categories.functional ?? false, analytics: record.categories.analytics ?? false, marketing: record.categories.marketing ?? false })
    }
  }, [record])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try { saveCategories(draft); setToast('Preferences saved.') } finally { setSaving(false) }
  }

  async function handleUnsubscribe() {
    setUnsubscribing(true); setUnsubErr(null)
    try {
      const res = await fetch('/api/preferences/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: 'praycalc.com' }), credentials: 'same-origin' })
      if (!res.ok) { const b = await res.json().catch(() => ({})) as { message?: string }; throw new Error(b.message ?? `Error ${res.status}`) }
      setDraft((p) => ({ ...p, marketing: false }))
      saveCategories({ ...draft, marketing: false })
      setToast('Unsubscribed from marketing emails.')
    } catch (err) { setUnsubErr(err instanceof Error ? err.message : 'Failed. Please try again.') }
    finally { setUnsubscribing(false) }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">&larr; Back to PrayCalc</Link>
        </nav>
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#C9F27A] mb-2">Privacy Preferences</h1>
          <p className="text-white/50 text-sm max-w-xl leading-relaxed">
            Control how PrayCalc uses your data. Your location is used only to calculate prayer times and Qibla direction — it is never stored without your consent.
          </p>
        </header>
        <form onSubmit={handleSave} noValidate aria-label="Consent preferences form">
          <fieldset className="border border-white/10 rounded-xl p-6 mb-6">
            <legend className="sr-only">Cookie categories</legend>
            <ToggleRow id="toggle-strictly-necessary" label="Strictly Necessary" description="Session token, CSRF protection. Your coarse location (country/region) for prayer time calculation is strictly necessary." checked disabled onChange={() => undefined} />
            <ToggleRow id="toggle-functional" label="Functional" description="Save your preferred calculation method, school of jurisprudence, and display settings between sessions." checked={draft.functional} onChange={(v) => setDraft((p) => ({ ...p, functional: v }))} />
            <ToggleRow id="toggle-analytics" label="Analytics" description="Anonymous usage analytics via self-hosted Umami. No location data included in analytics." checked={draft.analytics} onChange={(v) => setDraft((p) => ({ ...p, analytics: v }))} />
            <ToggleRow id="toggle-marketing" label="Marketing" description="Receive PrayCalc news and updates about new features and Islamic calendar events." checked={draft.marketing} onChange={(v) => setDraft((p) => ({ ...p, marketing: v }))} />
          </fieldset>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#79C24C] px-6 py-2.5 text-sm font-semibold text-[#0D2F17] hover:bg-[#C9F27A] disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save preferences'}
            </button>
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
          </div>
        </form>
        <section aria-labelledby="unsub-heading" className="border border-white/10 rounded-xl p-6 mb-10">
          <h2 id="unsub-heading" className="text-base font-semibold text-white mb-2">Unsubscribe from Marketing Emails</h2>
          <p className="text-sm text-white/50 mb-4">Remove your email from all PrayCalc marketing lists.</p>
          {unsubErr && <p role="alert" className="mb-3 text-sm text-red-400">{unsubErr}</p>}
          <button type="button" onClick={handleUnsubscribe} disabled={unsubscribing} className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50 transition-colors">
            {unsubscribing ? 'Processing...' : 'Unsubscribe from marketing emails'}
          </button>
        </section>
        <footer className="text-sm text-white/40 space-y-1">
          <p>Location data requests: <a href="mailto:privacy@ummat.dev" className="text-[#5A9438] hover:underline">privacy@ummat.dev</a></p>
          <p><Link href="/legal/california" className="text-[#5A9438] hover:underline">California privacy rights</Link></p>
        </footer>
      </div>
      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </main>
  )
}
