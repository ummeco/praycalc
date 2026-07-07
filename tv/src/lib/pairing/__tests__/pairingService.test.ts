/**
 * Purpose: Unit tests for PairingService — device ID persistence (AsyncStorage) and
 *   the TV-side pre-registration insert (task 3.1/3.2), including PIN-collision retry.
 * Constraints: urql Client is mocked (no real network); AsyncStorage uses the official
 *   @react-native-async-storage/async-storage jest mock, reset between tests.
 * SPORT: praycalc/tv services tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PairingService, getOrCreateDeviceId, isPinUniqueViolation } from '../pairingService';
import type { Client } from 'urql';
import type { PairingState } from '../../../types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const DEVICE_ID_KEY = 'praycalc-tv-device-id';

function makeMockClient(
  mutationImpl: (query: string, vars: Record<string, unknown>) => { data?: unknown; error?: { message: string } }
): Client {
  return {
    mutation: jest.fn((query: string, vars: Record<string, unknown>) => ({
      toPromise: () => Promise.resolve(mutationImpl(query, vars)),
    })),
    query: jest.fn(() => ({
      toPromise: () => Promise.resolve({ data: { pc_tv_pairing: [] } }),
    })),
  } as unknown as Client;
}

describe('getOrCreateDeviceId', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('creates and persists a device ID on first call', async () => {
    const id = await getOrCreateDeviceId();
    expect(id).toMatch(/^tv-/);
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    expect(stored).toBe(id);
  });

  it('returns the same persisted device ID on subsequent calls (survives relaunch)', async () => {
    const first = await getOrCreateDeviceId();
    const second = await getOrCreateDeviceId();
    expect(second).toBe(first);
  });
});

describe('isPinUniqueViolation', () => {
  it('detects the pc_tv_pairing_pin_key constraint error', () => {
    expect(isPinUniqueViolation({ message: 'Uniqueness violation. duplicate key value violates unique constraint "pc_tv_pairing_pin_key"' })).toBe(true);
  });

  it('does not flag unrelated errors', () => {
    expect(isPinUniqueViolation({ message: 'Network request failed' })).toBe(false);
    expect(isPinUniqueViolation(new Error('timeout'))).toBe(false);
  });
});

describe('PairingService pre-registration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('registers a PIN via insert_pc_tv_pairing_one with only pin + deviceId', async () => {
    const seenVars: Record<string, unknown>[] = [];
    const client = makeMockClient((query, vars) => {
      seenVars.push(vars);
      expect(query).toContain('insert_pc_tv_pairing_one');
      return { data: { insert_pc_tv_pairing_one: { pin: vars.pin, device_id: vars.deviceId, paired: false, is_active: true } } };
    });

    const states: PairingState[] = [];
    const service = new PairingService(client, (s) => states.push(s));
    await service.startPolling();
    service.destroy();

    expect(seenVars).toHaveLength(1);
    expect(seenVars[0]).toEqual({ pin: expect.stringMatching(/^\d{6}$/), deviceId: expect.stringMatching(/^tv-/) });
    expect(states[0].isPaired).toBe(false);
    expect(states[0].pin).toMatch(/^\d{6}$/);
  });

  it('retries with a new PIN on unique-violation and eventually succeeds', async () => {
    let attempt = 0;
    const client = makeMockClient(() => {
      attempt += 1;
      if (attempt < 3) {
        return { error: { message: 'Uniqueness violation. duplicate key value violates unique constraint "pc_tv_pairing_pin_key"' } };
      }
      return { data: { insert_pc_tv_pairing_one: { paired: false, is_active: true } } };
    });

    const states: PairingState[] = [];
    const service = new PairingService(client, (s) => states.push(s));
    await service.startPolling();
    service.destroy();

    expect(attempt).toBe(3);
    expect(states[0].pin).toMatch(/^\d{6}$/);
  });

  it('reuses the persisted device ID across two PairingService instances (relaunch simulation)', async () => {
    const client1 = makeMockClient(() => ({ data: { insert_pc_tv_pairing_one: { paired: false, is_active: true } } }));
    const service1 = new PairingService(client1, () => {});
    await service1.startPolling();
    const deviceId1 = service1.getDeviceId();
    service1.destroy();

    const client2 = makeMockClient(() => ({ data: { insert_pc_tv_pairing_one: { paired: false, is_active: true } } }));
    const service2 = new PairingService(client2, () => {});
    await service2.startPolling();
    const deviceId2 = service2.getDeviceId();
    service2.destroy();

    expect(deviceId2).toBe(deviceId1);
  });
});
