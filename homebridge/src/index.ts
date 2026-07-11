// homebridge-praycalc — PrayCalc prayer times as HomeKit contact sensors
// Each prayer is a contact sensor: OPEN when prayer time is active (within 30 min window), CLOSED otherwise

import type { API, AccessoryPlugin, AccessoryConfig, Logging, Service } from 'homebridge';

// PrayCalc Public API
const PRAYCALC_API = 'https://api.praycalc.com/api/v1/public/times';

interface PrayerTimesApiResponse {
  prayers: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

interface PluginConfig extends AccessoryConfig {
  latitude: number;
  longitude: number;
  method?: string;
  madhab?: string;
  windowMinutes?: number; // how long after prayer time the sensor stays OPEN (default: 30)
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type PrayerName = typeof PRAYERS[number];

export = (api: API) => {
  api.registerAccessory('homebridge-praycalc', 'PrayCalcPrayers', PrayCalcPlatform);
};

class PrayCalcPlatform implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly config: PluginConfig;
  private readonly api: API;
  private readonly services: Map<PrayerName, Service> = new Map();
  private prayerTimes: Map<PrayerName, string> = new Map();

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.config = config as PluginConfig;
    this.api = api;

    if (!this.config.latitude || !this.config.longitude) {
      throw new Error('homebridge-praycalc: latitude and longitude are required in config.json');
    }

    // Create one contact sensor service per prayer
    for (const prayer of PRAYERS) {
      const service = new this.api.hap.Service.ContactSensor(
        `${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer`,
        prayer
      );
      this.services.set(prayer, service);

      service.getCharacteristic(this.api.hap.Characteristic.ContactSensorState)
        .onGet(() => this.getPrayerState(prayer));
    }

    // Fetch times on startup and refresh every hour
    this.fetchPrayerTimes().catch(e => this.log.error('Initial fetch failed:', e));
    setInterval(() => {
      this.fetchPrayerTimes().catch(e => this.log.error('Refresh failed:', e));
    }, 60 * 60 * 1000);

    // Update sensor states every minute
    setInterval(() => this.updateAllSensors(), 60 * 1000);
  }

  private async fetchPrayerTimes(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const { latitude, longitude, method = 'isna', madhab = 'shafii' } = this.config;

    const url = `${PRAYCALC_API}?lat=${latitude}&lng=${longitude}&date=${today}&method=${method}&madhab=${madhab}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json() as PrayerTimesApiResponse;

    for (const prayer of PRAYERS) {
      this.prayerTimes.set(prayer, data.prayers[prayer]);
    }

    this.log.info(`Prayer times fetched for ${today}`);
    this.updateAllSensors();
  }

  private getPrayerState(prayer: PrayerName): number {
    const timeStr = this.prayerTimes.get(prayer);
    if (!timeStr) return this.api.hap.Characteristic.ContactSensorState.CONTACT_DETECTED; // CLOSED

    const now = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);

    const windowMs = (this.config.windowMinutes ?? 30) * 60 * 1000;
    const diffMs = now.getTime() - prayerDate.getTime();

    // OPEN (contact NOT detected) when within prayer window
    const isActive = diffMs >= 0 && diffMs <= windowMs;
    return isActive
      ? this.api.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
      : this.api.hap.Characteristic.ContactSensorState.CONTACT_DETECTED;
  }

  private updateAllSensors(): void {
    for (const prayer of PRAYERS) {
      const service = this.services.get(prayer);
      service?.getCharacteristic(this.api.hap.Characteristic.ContactSensorState)
        .updateValue(this.getPrayerState(prayer));
    }
  }

  getServices(): Service[] {
    return Array.from(this.services.values());
  }
}
