/**
 * Purpose: TV pairing service — generates PIN, polls pairing status, manages state
 * Inputs: urql client, PIN polling interval
 * Outputs: PairingState updates via callback; QR code URI string
 * Constraints: Uses pc_tv_pairing table (NOT fl_tv_device_pairing which is flock)
 * SPORT: praycalc/tv services
 */

import { Client } from 'urql';
import { CHECK_PRAYCALC_PAIRING } from '../graphql/queries';
import { PairingState } from '../../types';

const POLL_INTERVAL_MS = 5000;
const PIN_LENGTH = 6;
const QR_SCHEME = 'praycalc://pair';

function generatePin(): string {
  const digits = Array.from({ length: PIN_LENGTH }, () =>
    Math.floor(Math.random() * 10).toString()
  );
  return digits.join('');
}

function generateDeviceId(): string {
  // Stable device ID using timestamp + random — in production, read from AsyncStorage
  return `tv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildQrCodeUri(pin: string): string {
  return `${QR_SCHEME}?pin=${pin}`;
}

export class PairingService {
  private pin: string;
  private deviceId: string;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private client: Client;
  private onStateChange: (state: PairingState) => void;

  constructor(client: Client, onStateChange: (state: PairingState) => void) {
    this.client = client;
    this.onStateChange = onStateChange;
    this.pin = generatePin();
    this.deviceId = generateDeviceId();
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

  startPolling(): void {
    if (this.pollTimer) return;

    // Emit initial state
    this.onStateChange({ pin: this.pin, deviceId: this.deviceId, isPaired: false });

    this.pollTimer = setInterval(async () => {
      try {
        const result = await this.client
          .query(CHECK_PRAYCALC_PAIRING, { pin: this.pin })
          .toPromise();

        const row = result.data?.pc_tv_pairing?.[0];
        if (row?.paired && row?.user_id) {
          this.stopPolling();
          this.onStateChange({
            pin: this.pin,
            deviceId: row.device_id ?? this.deviceId,
            isPaired: true,
            userId: row.user_id,
          });
        }
      } catch {
        // Network errors are non-fatal during polling — try again next interval
      }
    }, POLL_INTERVAL_MS);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  regeneratePin(): void {
    this.stopPolling();
    this.pin = generatePin();
    this.onStateChange({ pin: this.pin, deviceId: this.deviceId, isPaired: false });
    this.startPolling();
  }

  destroy(): void {
    this.stopPolling();
  }
}
