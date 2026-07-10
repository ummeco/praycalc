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
import { formatTime as formatTimeWithSettings } from '../lib/formatTime';

/** Prayers eligible to be shown as "next" — Sunrise is not a salah. */
const NEXT_PRAYER_CANDIDATES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export interface NextPrayerResult {
  name: PrayerName;
  time: Date;
  cityName: string | null;
}

/** A single prayer occurrence used to build the iOS widget timeline. */
export interface WidgetPrayerEntry {
  /** Prayer name (e.g. "Fajr"). */
  name: PrayerName;
  /** Epoch milliseconds of this prayer's time. */
  timestamp: number;
}

/**
 * Full data payload the iOS WidgetKit extension reads from App Group UserDefaults.
 * Carries the current next prayer PLUS every remaining prayer today (and tomorrow's
 * Fajr) so the Swift TimelineProvider can advance the displayed entry locally at each
 * prayer time without waking the RN app for a recompute.
 */
export interface IosWidgetPayload {
  /** City label under the time, or null if the location has no city name. */
  cityName: string | null;
  /**
   * Ordered future-prayer occurrences (soonest first): today's not-yet-passed
   * prayers, then tomorrow's Fajr as the terminal entry. Empty only if the engine
   * produced no valid times.
   */
  entries: WidgetPrayerEntry[];
  /** When this payload was computed (epoch ms) — lets Swift detect staleness. */
  generatedAt: number;
}

/** Resolved settings + a same-day/other-day compute closure, shared by all widget calcs. */
interface ResolvedWidgetContext {
  cityName: string | null;
  now: Date;
  computeFor: (date: Date) => Record<PrayerName, Date>;
}

/**
 * Rehydrate settings and build the compute closure using the SAME settings precedence
 * as PrayerNotificationService (travel location while musafir mode is on, else home).
 * Returns null when no location is configured. Single source of truth for both the
 * single-next-prayer path and the full iOS timeline payload so neither can drift.
 */
async function resolveWidgetContext(): Promise<ResolvedWidgetContext | null> {
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

  return { cityName: location.city ?? null, now: new Date(), computeFor };
}

/**
 * Compute the next upcoming prayer (today, or tomorrow's Fajr if all of today's
 * have passed), using the same settings precedence as PrayerNotificationService:
 * travel location while musafir mode is on, else home location.
 * Exported so both the widget task handler and any caller that wants an immediate
 * repaint (PrayerNotificationService, HomeWidgetStub) share one implementation.
 */
export async function computeNextPrayer(): Promise<NextPrayerResult | null> {
  const ctx = await resolveWidgetContext();
  if (!ctx) return null;
  const { cityName, now, computeFor } = ctx;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayTimes = computeFor(today);

  for (const name of NEXT_PRAYER_CANDIDATES) {
    const t = todayTimes[name];
    if (t instanceof Date && !Number.isNaN(t.getTime()) && t.getTime() > now.getTime()) {
      return { name, time: t, cityName };
    }
  }

  // All of today's prayers have passed — fall back to tomorrow's Fajr.
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = computeFor(tomorrow);
  const fajr = tomorrowTimes.Fajr;
  if (fajr instanceof Date && !Number.isNaN(fajr.getTime())) {
    return { name: 'Fajr', time: fajr, cityName };
  }

  return null;
}

/**
 * Build the full iOS widget payload: every remaining prayer today (soonest first)
 * plus tomorrow's Fajr as the terminal entry. Reuses resolveWidgetContext so the
 * location/method/madhab/high-lat/custom-angle/minute-adjust path is identical to
 * computeNextPrayer and PrayerNotificationService — no duplicated engine wiring.
 * Returns null when no location is configured (widget then shows "Open PrayCalc").
 */
export async function computeIosWidgetPayload(): Promise<IosWidgetPayload | null> {
  const ctx = await resolveWidgetContext();
  if (!ctx) return null;
  const { cityName, now, computeFor } = ctx;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayTimes = computeFor(today);

  const entries: WidgetPrayerEntry[] = [];
  for (const name of NEXT_PRAYER_CANDIDATES) {
    const t = todayTimes[name];
    if (t instanceof Date && !Number.isNaN(t.getTime()) && t.getTime() > now.getTime()) {
      entries.push({ name, timestamp: t.getTime() });
    }
  }

  // Always append tomorrow's Fajr as the terminal timeline entry so the widget still
  // shows a valid "next prayer" after Isha passes, without waking the app overnight.
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fajr = computeFor(tomorrow).Fajr;
  if (fajr instanceof Date && !Number.isNaN(fajr.getTime())) {
    entries.push({ name: 'Fajr', timestamp: fajr.getTime() });
  }

  if (entries.length === 0) return null;
  return { cityName, entries, generatedAt: now.getTime() };
}

/** Exported for reuse by callers that need to build the same widget-visible time string.
 *  Respects the user's timeFormat (12h/24h) + locale settings (MOB-6) — kept as a
 *  single-Date-argument function so existing callers (liveActivity.ts,
 *  HomeWidgetStub.tsx) do not need to change. */
export function formatTime(date: Date): string {
  const { timeFormat, locale } = useSettingsStore.getState();
  return formatTimeWithSettings(date, timeFormat, locale);
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
