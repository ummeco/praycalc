/**
 * SettingsPanel.tsx — City-page settings panel.
 *
 * PURPOSE: Display + behavior preferences (light mode, madhab, time format,
 *   countdown, Qiyam), notification sound (+ adhan voice), and Home City. When a
 *   session exists, display toggles are replaced by account controls.
 * DOM contract (settings.spec / account.spec):
 *   .settings-panel; .settings-row (label + one toggle button per row);
 *   .settings-sound-opt(.--on); .settings-auth-btn--account; .settings-signout-link;
 *   .settings-manage-link. Toggle aria-labels: "Light Mode"/"Dark Mode",
 *   "Hanafi Asr", "24-hour", "Countdown", "Show Qiyam".
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import type { PrayCalcSettings } from '@/lib/settings';
import type { PrayCalcSession } from '@/lib/session';
import { CALC_METHOD_OPTIONS } from '@/lib/prayer-utils';

interface Props {
  settings: PrayCalcSettings;
  onChange: <K extends keyof PrayCalcSettings>(key: K, value: PrayCalcSettings[K]) => void;
  session: PrayCalcSession | null;
  onSignOut: () => void;
  panelRef?: React.Ref<HTMLDivElement>;
}

function Toggle({
  on,
  ariaLabel,
  onToggle,
}: {
  on: boolean;
  ariaLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      className={`settings-toggle inline-flex items-center w-11 h-6 rounded-full px-0.5 shrink-0 transition-colors ${
        on ? 'settings-toggle--on bg-ummat-mid justify-end' : 'bg-white/20 justify-start'
      }`}
      onClick={onToggle}
    >
      <span className="settings-toggle-thumb block w-5 h-5 rounded-full bg-white" aria-hidden="true" />
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="settings-row flex items-center justify-between gap-4 py-2">
      <span className="settings-row-label">{label}</span>
      {children}
    </div>
  );
}

const SOUND_MODES: { value: 'none' | 'beep' | 'adhan'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'beep', label: 'Beep' },
  { value: 'adhan', label: 'Adhan' },
];

const ADHAN_VOICES: { value: 'makkah' | 'mishari'; label: string }[] = [
  { value: 'makkah', label: 'Mecca' },
  { value: 'mishari', label: 'Mishary' },
];

export default function SettingsPanel({ settings: s, onChange, session, onSignOut, panelRef }: Props) {
  return (
    <div className="settings-panel" ref={panelRef} role="dialog" aria-label="Settings">
      {session ? (
        <div className="settings-account">
          <button type="button" className="settings-auth-btn settings-auth-btn--account">
            {session.displayName}
          </button>
          <div className="settings-row settings-account-row">
            <span className="settings-row-label">Account Settings</span>
            <a className="settings-manage-link" href="/account">Manage in Account</a>
          </div>
          <button type="button" className="settings-signout-link" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      ) : (
        <div className="settings-display">
          <Row label="Light Mode">
            <Toggle
              on={s.lightMode}
              ariaLabel={s.lightMode ? 'Dark Mode' : 'Light Mode'}
              onToggle={() => onChange('lightMode', !s.lightMode)}
            />
          </Row>
          <Row label="Hanafi Asr">
            <Toggle on={s.hanafi} ariaLabel="Hanafi Asr" onToggle={() => onChange('hanafi', !s.hanafi)} />
          </Row>
          <Row label="24-hour time">
            <Toggle on={s.use24h} ariaLabel="24-hour" onToggle={() => onChange('use24h', !s.use24h)} />
          </Row>
          <Row label="Countdown">
            <Toggle on={s.countdown} ariaLabel="Countdown" onToggle={() => onChange('countdown', !s.countdown)} />
          </Row>
          <Row label="Show Qiyam">
            <Toggle on={s.showQiyam} ariaLabel="Show Qiyam" onToggle={() => onChange('showQiyam', !s.showQiyam)} />
          </Row>
        </div>
      )}

      {/* Calculation method — always visible; DPC is the recommended default */}
      <div className="settings-section">
        <h3 className="settings-section-title">Calculation Method</h3>
        <label className="sr-only" htmlFor="calc-method-select">Calculation method</label>
        <select
          id="calc-method-select"
          className="settings-method-select w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
          aria-label="Calculation method"
          value={s.calcMethod}
          onChange={(e) => onChange('calcMethod', e.target.value)}
        >
          {CALC_METHOD_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Notification — always visible */}
      <div className="settings-section">
        <h3 className="settings-section-title">Notification</h3>
        <div className="settings-sound-opts">
          {SOUND_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={`settings-sound-opt${s.soundMode === m.value ? ' settings-sound-opt--on' : ''}`}
              onClick={() => onChange('soundMode', m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {s.soundMode === 'adhan' && (
          <div className="settings-voice-opts">
            {ADHAN_VOICES.map((v) => (
              <button
                key={v.value}
                type="button"
                className={`settings-sound-opt${s.adhanVoice === v.value ? ' settings-sound-opt--on' : ''}`}
                onClick={() => onChange('adhanVoice', v.value)}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Home City — always visible */}
      <div className="settings-section">
        <h3 className="settings-section-title">Home City</h3>
        <p className="settings-section-note">Pin a city for quick access on the home screen.</p>
      </div>
    </div>
  );
}
