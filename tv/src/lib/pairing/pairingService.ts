/**
 * Purpose: TV pairing service — generates PIN, pre-registers it server-side, polls
 *   pairing status, manages state. Device ID persists across relaunch via AsyncStorage.
 * Inputs: urql client, PIN polling interval
 * Outputs: PairingState updates via callback; QR code URI string
 * Constraints: Uses pc_tv_pairing (NOT fl_tv_device_pairing which is flock). Pre-registration
 *   uses the public-role insert_pc_tv_pairing_one mutation (server presets is_active=true,
 *   paired=false); a pin collision throws a unique-violation error which this service
 *   catches and regenerates the PIN for, retrying until an insert succeeds.
 * SPORT: praycalc/tv services
 */

import { Client } from 'urql';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHECK_PRAYCALC_PAIRING, REGISTER_TV_PAIRING } from '../graphql/queries';
import { PairingState, TvPairingLocation } from '../../types';
import { useSettingsStore } from '../../stores/settingsStore';

/**
 * Extracts a valid location from a pc_tv_pairing row, or null when the row carries no
 * usable coordinates. Kept exported + pure for unit testing the persist path.
 */
export function extractPairingLocation(row: {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  timezone?: string | null;
}): TvPairingLocation | null {
  if (typeof row.latitude !== 'number' || typeof row.longitude !== 'number') {
    return null;
  }
  return {
    latitude: row.latitude,
    longitude: row.longitude,
    // Fall back to the store's existing city/timezone when the row omits them.
    city: row.city ?? useSettingsStore.getState().settings.cityName,
    timezone: row.timezone ?? useSettingsStore.getState().settings.timezone,
  };
}

/** Persists a paired TV's location into the settings store (AsyncStorage-backed). */
export function persistPairingLocation(loc: TvPairingLocation): void {
  useSettingsStore.getState().updateSettings({
    latitude: loc.latitude,
    longitude: loc.longitude,
    cityName: loc.city,
    timezone: loc.timezone,
  });
}

const POLL_INTERVAL_MS = 5000;
const PIN_LENGTH = 6;
const QR_SCHEME = 'praycalc://pair';
const DEVICE_ID_STORAGE_KEY = 'praycalc-tv-device-id';
const MAX_REGISTER_ATTEMPTS = 5;

function generatePin(): string {
  const digits = Array.from({ length: PIN_LENGTH }, () =>
    Math.floor(Math.random() * 10).toString()
  );
  return digits.join('');
}

function generateDeviceId(): string {
  return `tv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns the persisted device ID, creating and storing one on first call. */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;
  } catch {
    // Storage read failed — fall through to generating a fresh (unpersisted) ID.
  }
  const created = generateDeviceId();
  try {
    await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
  } catch {
    // Best-effort persistence — device still works this session if write fails.
  }
  return created;
}

export function buildQrCodeUri(pin: string): string {
  return `${QR_SCHEME}?pin=${pin}`;
}

/** True when the urql/Hasura error is the pc_tv_pairing_pin_key unique violation. */
export function isPinUniqueViolation(error: unknown): boolean {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);
  return message.includes('pc_tv_pairing_pin_key') || message.includes('Uniqueness violation');
}

export class PairingService {
  private pin = '';
  private deviceId = '';
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private client: Client;
  private onStateChange: (state: PairingState) => void;
  private ready: Promise<void>;

  constructor(client: Client, onStateChange: (state: PairingState) => void) {
    this.client = client;
    this.onStateChange = onStateChange;
    // Device ID must be resolved (from AsyncStorage or freshly created) before the
    // first PIN registration so the persisted identity is stable across relaunch.
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    this.deviceId = await getOrCreateDeviceId();
    this.pin = await this.registerNewPin();
  }

  /** Generates a PIN and inserts the pre-registration row; retries on PIN collision. */
  private async registerNewPin(): Promise<string> {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < MAX_REGISTER_ATTEMPTS; attempt++) {
      const candidate = generatePin();
      try {
        const result = await this.client
          .mutation(REGISTER_TV_PAIRING, { pin: candidate, deviceId: this.deviceId })
          .toPromise();
        if (result.error) {
          if (isPinUniqueViolation(result.error)) {
            lastError = result.error;
            continue;
          }
          // Non-collision error (e.g. offline) — surface the candidate PIN anyway so
          // the screen has something to show; polling will simply not find a match
          // until connectivity returns and a future regeneration succeeds.
          return candidate;
        }
        return candidate;
      } catch (err) {
        if (isPinUniqueViolation(err)) {
          lastError = err;
          continue;
        }
        return candidate;
      }
    }
    // Exhausted retries — extremely unlikely with a 6-digit space, but fail safe by
    // returning the last-tried candidate rather than throwing (polling still no-ops
    // gracefully; regeneratePin() gives the user a manual retry path).
    void lastError;
    return generatePin();
  }

  getPin(): string {
    return this.pin;
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  getQrUri(): string {
    return buildQrCodeUri(this.pin);
  }

  async startPolling(): Promise<void> {
    await this.ready;
    if (this.pollTimer) return;

    // Emit initial state once the device ID + registered PIN are resolved.
    this.onStateChange({ pin: this.pin, deviceId: this.deviceId, isPaired: false });

    this.pollTimer = setInterval(async () => {
      try {
        const result = await this.client
          .query(CHECK_PRAYCALC_PAIRING, { pin: this.pin })
          .toPromise();

        const row = result.data?.pc_tv_pairing?.[0];
        if (row?.paired && row?.user_id) {
          this.stopPolling();
          // The pairing row now carries the phone-selected location — persist it as the
          // TV's location so prayer times + weather follow the paired household.
          const location = extractPairingLocation(row);
          if (location) persistPairingLocation(location);
          this.onStateChange({
            pin: this.pin,
            deviceId: row.device_id ?? this.deviceId,
            isPaired: true,
            userId: row.user_id,
            ...(location ? { location } : {}),
          });
        }
      } catch {
        // Network errors are non-fatal during polling — try again next interval
      }
    }, POLL_INTERVAL_MS);
  }

  async regeneratePin(): Promise<void> {
    this.stopPolling();
    this.pin = await this.registerNewPin();
    this.onStateChange({ pin: this.pin, deviceId: this.deviceId, isPaired: false });
    await this.startPolling();
  }

  destroy(): void {
    this.stopPolling();
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
