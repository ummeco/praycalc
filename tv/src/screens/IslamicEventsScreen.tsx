/**
 * Purpose: Screen 14 — Islamic Events: upcoming Islamic dates in list/grid
 * Inputs: pc_islamic_event via urql (live, public role) — Hijri (month, day) pairs;
 *   converted to upcoming Gregorian occurrences via hijriToGregorian; current date.
 *   Falls back to the bundled ISLAMIC_EVENTS list (lib/hijri) on fetch failure/offline.
 * Outputs: D-pad navigable grid of upcoming events; significant events highlighted
 * Constraints: hasTVPreferredFocus on first event; min 88pt rows; D-pad Up/Down through list.
 *   DATA PATH: live query. pc_islamic_event now exists in production (Wave-1 gap closure
 *   W1.3, 2026-07-07 — 7 rows seeded, public role select, verified live against
 *   api.praycalc.com). Mawlid al-Nabi is deliberately NOT in the seed (content gate, user
 *   directive 2026-07-07) — this screen MUST NOT show it regardless of data source; the
 *   fallback list (lib/hijri ISLAMIC_EVENTS) already excludes it too, so neither path can
 *   surface it. Hijri month/day pairs are converted to the next upcoming Gregorian date via
 *   the shared @umalqura/core engine, so dates are always correct for the current Hijri year
 *   rather than a hardcoded, staleness-prone Gregorian list.
 * SPORT: praycalc/tv screens
 */

import React, { useMemo } from 'react';
import { useFocusDestination } from '../hooks/useFocusDestination';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from 'urql';
import { RootStackParamList, IslamicEvent as TvIslamicEvent } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';
import { ISLAMIC_EVENTS, gregorianToHijri, hijriToGregorian } from '../lib/hijri';
import { GET_ISLAMIC_EVENTS } from '../lib/graphql/queries';

type EventsNavProp = StackNavigationProp<RootStackParamList, 'IslamicEvents'>;

interface PcIslamicEventRow {
  id: string;
  name: string;
  hijri_month: number;
  hijri_day: number;
  description: string;
}

/** Content-gate: hard-block Mawlid regardless of data source (defense in depth). */
const isBlockedEventName = (name: string): boolean => /mawlid/i.test(name);

/** Next upcoming Gregorian occurrence of a Hijri month/day, rolling to next Hijri year if past. */
export function nextOccurrence(hijriMonth: number, hijriDay: number, today: Date): Date {
  const todayHijri = gregorianToHijri(today);
  let candidate = hijriToGregorian(todayHijri.year, hijriMonth, hijriDay);
  if (candidate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
    candidate = hijriToGregorian(todayHijri.year + 1, hijriMonth, hijriDay);
  }
  return candidate;
}

interface EventSource {
  id: string;
  name: string;
  hijriMonth: number;
  hijriDay: number;
}

export function buildUpcomingEvents(sources: EventSource[], today: Date): TvIslamicEvent[] {
  return sources
    .filter((e) => !isBlockedEventName(e.name))
    .map((e) => {
      const gregorian = nextOccurrence(e.hijriMonth, e.hijriDay, today);
      const hijri = gregorianToHijri(gregorian);
      return {
        id: e.id,
        nameAr: '', // Neither pc_islamic_event nor the fallback list carries Arabic names — English only, honest
        nameEn: e.name,
        hijriDate: `${hijri.day} ${hijri.monthName} ${hijri.year}`,
        gregorianDate: gregorian.toISOString().split('T')[0],
        isSignificant: true,
      };
    })
    .sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate));
}

export default function IslamicEventsScreen(): React.JSX.Element {
  const navigation = useNavigation<EventsNavProp>();
  const [firstNode, firstRef] = useFocusDestination<TouchableHighlight>();
  const todayStr = new Date().toISOString().split('T')[0];

  const [{ data, fetching, error }] = useQuery<{ pc_islamic_event: PcIslamicEventRow[] }>({
    query: GET_ISLAMIC_EVENTS,
  });

  const pcRows = data?.pc_islamic_event;
  const usingFallback = !pcRows || pcRows.length === 0;

  // Recompute the source list only when the live rows change (or fallback kicks in),
  // and the final upcoming-occurrence list only once per calendar day on top of that —
  // `new Date()` itself is intentionally excluded from both deps arrays (its identity
  // changes every render, which would defeat the memo).
  const sources: EventSource[] = useMemo(() => {
    if (pcRows && pcRows.length > 0) {
      return pcRows.map((row) => ({
        id: row.id,
        name: row.name,
        hijriMonth: row.hijri_month,
        hijriDay: row.hijri_day,
      }));
    }
    return ISLAMIC_EVENTS.map((e, idx) => ({
      id: String(idx + 1),
      name: e.name,
      hijriMonth: e.hijriMonth,
      hijriDay: e.hijriDay,
    }));
  }, [pcRows]);

  const upcoming = useMemo(() => buildUpcomingEvents(sources, new Date()), [todayStr, sources]);

  if (fetching && !data) {
    return (
      <TvScreenWrapper title="Islamic Events" onBack={() => navigation.goBack()}>
        <View style={styles.centerState}>
          <ActivityIndicator color="#C9F27A" size="large" />
        </View>
      </TvScreenWrapper>
    );
  }

  return (
    <TvScreenWrapper title="Islamic Events" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        {(error || usingFallback) && (
          <Text style={styles.offlineNotice}>
            {error ? 'Offline — showing bundled events' : 'Showing bundled events'}
          </Text>
        )}
        {upcoming.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming events available.</Text>
        ) : (
          <TVFocusGuideView style={styles.list} destinations={firstNode ? [firstNode] : []}>
            <FlatList
              data={upcoming}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                const daysUntil = Math.ceil(
                  (new Date(item.gregorianDate).getTime() - Date.now()) / 86400000
                );
                return (
                  <TouchableHighlight
                    ref={index === 0 ? firstRef : null}
                    hasTVPreferredFocus={index === 0}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.nameEn} on ${item.gregorianDate}`}
                    onPress={() => {}}
                    underlayColor="#1E5E2F"
                    style={[
                      styles.eventRow,
                      item.isSignificant && styles.eventRowSignificant,
                    ]}
                  >
                    <View style={styles.eventRowInner}>
                      <View style={styles.eventLeft}>
                        <Text style={styles.eventNameEn}>{item.nameEn}</Text>
                      </View>
                      <View style={styles.eventRight}>
                        <Text style={styles.eventHijri}>{item.hijriDate}</Text>
                        <Text style={styles.eventGregorian}>{item.gregorianDate}</Text>
                        <Text style={styles.eventDaysUntil}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </Text>
                      </View>
                    </View>
                  </TouchableHighlight>
                );
              }}
            />
          </TVFocusGuideView>
        )}
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 40 },
  centerState: {
    flex: 1,
    backgroundColor: '#0D2F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineNotice: {
    color: '#79C24C',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 60,
  },
  list: { flex: 1 },
  eventRow: {
    borderRadius: 12, borderWidth: 2, borderColor: 'transparent', marginBottom: 8, minHeight: 88,
  },
  eventRowSignificant: { borderColor: '#1E5E2F' },
  eventRowInner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#1E5E2F', borderRadius: 10,
  },
  eventLeft: { flex: 1 },
  eventNameEn: { color: '#FFFFFF', fontSize: 26, fontWeight: '600' },
  eventRight: { alignItems: 'flex-end' },
  eventHijri: { color: '#79C24C', fontSize: 20 },
  eventGregorian: { color: '#FFFFFF', fontSize: 22, marginTop: 4 },
  eventDaysUntil: { color: '#C9F27A', fontSize: 24, fontWeight: '700', marginTop: 4 },
});
