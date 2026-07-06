/**
 * Purpose: react-native-android-widget task handler for the "NextPrayer" home-screen
 *   widget — computes today's next prayer using the SAME settings + calc engine the
 *   app itself uses (mirrors getUpcomingPrayerNotifications in PrayerNotificationService),
 *   and renders NextPrayerWidget for every WIDGET_ADDED/WIDGET_UPDATE/WIDGET_RESIZED
 *   event. WIDGET_CLICK opens the app (via clickAction="OPEN_APP" on the widget tree,
 *   handled natively); WIDGET_DELETED is a no-op (renderWidget already skips it).
 * Inputs: useSettingsStore.getState() after persist.rehydrate() (headless JS context —
 *   store may not be hydrated yet), calculatePrayerTimes from lib/prayer-calc.
 * Outputs: registerWidgetTaskHandler(widgetTaskHandler) call site — see index.js.
 * Constraints: Runs in a headless JS context (no React tree mounted, no navigation).
 *   Location is travel-aware: musafirMode + travelLocation set take priority over
 *   home location, identical to PrayerNotificationService's getUpcomingPrayerNotifications.
 *   No location configured -> render the "Set your location" empty state instead of
 *   throwing or leaving the widget blank.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-widget-task-handler
 */

import type * as React from 'react';
import type { WidgetTaskHandler, WidgetTaskHandlerProps } from 'react-native-android-widget';
import { calculatePrayerTimes } from '../lib/prayer-calc';
import { resolveTimezoneOffset } from '../lib/timezone';
import { useSettingsStore } from '../features/settings/store/useSettingsStore';
import type { CalcMethodKey } from '../constants/methods';
import type { PrayerName } from '../types/prayer';
import { NextPrayerWidget } from './NextPrayerWidget';

/** Prayers eligible to be shown as "next" — Sunrise is not a salah. */
const NEXT_PRAYER_CANDIDATES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export interface NextPrayerResult {
  name: PrayerName;
  time: Date;
  cityName: string | null;
}

/**
 * Compute the next upcoming prayer (today, or tomorrow's Fajr if all of today's
 * have passed), using the same settings precedence as PrayerNotificationService:
 * travel location while musafir mode is on, else home location.
 * Exported so both the widget task handler and any caller that wants an immediate
 * repaint (PrayerNotificationService, HomeWidgetStub) share one implementation.
 */
export async function computeNextPrayer(): Promise<NextPrayerResult | null> {
  // Headless task context — cold start may run before AsyncStorage rehydration completes.
  await useSettingsStore.persist.rehydrate();
  const settings = useSettingsStore.getState();

  const location = settings.musafirMode && settings.travelLocation
    ? settings.travelLocation
    : settings.location;
  if (!location) return null;

  const customAngles = settings.method === 'Custom'
    ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
    : undefined;

  const now = new Date();
  const computeFor = (date: Date) => calculatePrayerTimes(
    date,
    location.latitude,
    location.longitude,
    resolveTimezoneOffset(location.timezone, date),
    settings.method as CalcMethodKey,
    settings.madhab,
    settings.highLatRule,
    customAngles,
    settings.prayerMinuteAdjustments,
  );

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayTimes = computeFor(today);

  for (const name of NEXT_PRAYER_CANDIDATES) {
    const t = todayTimes[name];
    if (t instanceof Date && !Number.isNaN(t.getTime()) && t.getTime() > now.getTime()) {
      return { name, time: t, cityName: location.city ?? null };
    }
  }

  // All of today's prayers have passed — fall back to tomorrow's Fajr.
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = computeFor(tomorrow);
  const fajr = tomorrowTimes.Fajr;
  if (fajr instanceof Date && !Number.isNaN(fajr.getTime())) {
    return { name: 'Fajr', time: fajr, cityName: location.city ?? null };
  }

  return null;
}

/** Exported for reuse by callers that need to build the same widget-visible time string. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Build the NextPrayerWidget JSX for the current settings/prayer state. Shared by
 * the task handler below and by any caller that wants an out-of-band repaint
 * (PrayerNotificationService.refreshHomeScreenWidget, HomeWidgetStub.writeWidgetData)
 * so there is exactly one place that decides what the widget currently shows.
 */
export async function renderCurrentNextPrayerWidget(): Promise<React.JSX.Element> {
  const next = await computeNextPrayer();
  return next
    ? NextPrayerWidget({
      prayerName: next.name,
      formattedTime: formatTime(next.time),
      cityName: next.cityName,
    })
    : NextPrayerWidget({ prayerName: null, formattedTime: null, cityName: null });
}

/**
 * Widget task handler registered via registerWidgetTaskHandler in index.js.
 * Handles WIDGET_ADDED / WIDGET_UPDATE / WIDGET_RESIZED by rendering the current
 * next-prayer state; WIDGET_DELETED is skipped by the library before renderWidget
 * is even invoked with a paint call, so no explicit branch is needed here.
 */
export const widgetTaskHandler: WidgetTaskHandler = async (props: WidgetTaskHandlerProps) => {
  props.renderWidget(await renderCurrentNextPrayerWidget());
};
