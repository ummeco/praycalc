/**
 * Purpose: Screen 14 — Islamic Events: upcoming Islamic dates in list/grid
 * Inputs: ISLAMIC_EVENTS from lib/hijri (shared with mobile), converted to upcoming
 *   Gregorian occurrences via hijriToGregorian; current date
 * Outputs: D-pad navigable grid of upcoming events; significant events highlighted
 * Constraints: hasTVPreferredFocus on first event; min 88pt rows; D-pad Up/Down through list.
 *   DATA PATH: bundled, not live-queried. pc_islamic_event does NOT exist in production
 *   (probed api.praycalc.com 2026-07-06 — "field 'pc_islamic_event' not found in type:
 *   'query_root'"). Event list is the same ISLAMIC_EVENTS array mobile/src/lib/hijri/index.ts
 *   uses (ported to tv/src/lib/hijri/index.ts task 3.5) — Hijri month/day pairs converted to
 *   the next upcoming Gregorian date via the shared @umalqura/core engine, so dates are always
 *   correct for the current Hijri year rather than a hardcoded, staleness-prone Gregorian list.
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, IslamicEvent as TvIslamicEvent } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';
import { ISLAMIC_EVENTS, gregorianToHijri, hijriToGregorian } from '../lib/hijri';

type EventsNavProp = StackNavigationProp<RootStackParamList, 'IslamicEvents'>;

/** Next upcoming Gregorian occurrence of a Hijri month/day, rolling to next Hijri year if past. */
function nextOccurrence(hijriMonth: number, hijriDay: number, today: Date): Date {
  const todayHijri = gregorianToHijri(today);
  let candidate = hijriToGregorian(todayHijri.year, hijriMonth, hijriDay);
  if (candidate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
    candidate = hijriToGregorian(todayHijri.year + 1, hijriMonth, hijriDay);
  }
  return candidate;
}

function buildUpcomingEvents(today: Date): TvIslamicEvent[] {
  return ISLAMIC_EVENTS
    .map((e, idx) => {
      const gregorian = nextOccurrence(e.hijriMonth, e.hijriDay, today);
      const hijri = gregorianToHijri(gregorian);
      return {
        id: String(idx + 1),
        nameAr: '', // Source module (lib/hijri) does not carry Arabic names — English only, honest
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

  // Recompute once per calendar day (todayStr as the memo key), not on every render —
  // `new Date()` itself is intentionally excluded from the deps array.
  const upcoming = useMemo(() => buildUpcomingEvents(new Date()), [todayStr]);

  return (
    <TvScreenWrapper title="Islamic Events" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
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
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 40 },
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
