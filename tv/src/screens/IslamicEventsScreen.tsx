/**
 * Purpose: Screen 14 — Islamic Events: upcoming Islamic dates in list/grid
 * Inputs: Islamic events from pc_islamic_event (Gregorian + Hijri); current date
 * Outputs: D-pad navigable grid of upcoming events; significant events highlighted
 * Constraints: hasTVPreferredFocus on first event; min 88pt rows; D-pad Up/Down through list
 * SPORT: praycalc/tv screens
 */

import React from 'react';
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
import { RootStackParamList, IslamicEvent } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';

type EventsNavProp = StackNavigationProp<RootStackParamList, 'IslamicEvents'>;

// Sample events — production fetches from pc_islamic_event
const UPCOMING_EVENTS: IslamicEvent[] = [
  {
    id: '1', nameAr: 'رأس السنة الهجرية', nameEn: 'Islamic New Year (1 Muharram)',
    hijriDate: '1 Muharram 1447', gregorianDate: '2025-06-27', isSignificant: true,
  },
  {
    id: '2', nameAr: 'يوم عاشوراء', nameEn: 'Day of Ashura (10 Muharram)',
    hijriDate: '10 Muharram 1447', gregorianDate: '2025-07-06', isSignificant: true,
  },
  {
    id: '3', nameAr: 'المولد النبوي الشريف', nameEn: 'Mawlid an-Nabi',
    hijriDate: '12 Rabi al-Awwal 1447', gregorianDate: '2025-09-04', isSignificant: true,
  },
  {
    id: '4', nameAr: 'رمضان المبارك', nameEn: 'Ramadan begins',
    hijriDate: '1 Ramadan 1447', gregorianDate: '2026-02-18', isSignificant: true,
  },
  {
    id: '5', nameAr: 'ليلة القدر', nameEn: 'Laylat al-Qadr (27 Ramadan)',
    hijriDate: '27 Ramadan 1447', gregorianDate: '2026-03-16', isSignificant: true,
  },
  {
    id: '6', nameAr: 'عيد الفطر', nameEn: 'Eid al-Fitr (1 Shawwal)',
    hijriDate: '1 Shawwal 1447', gregorianDate: '2026-03-20', isSignificant: true,
  },
  {
    id: '7', nameAr: 'يوم عرفة', nameEn: 'Day of Arafah (9 Dhul Hijjah)',
    hijriDate: '9 Dhul Hijjah 1447', gregorianDate: '2026-05-26', isSignificant: true,
  },
  {
    id: '8', nameAr: 'عيد الأضحى', nameEn: 'Eid al-Adha (10 Dhul Hijjah)',
    hijriDate: '10 Dhul Hijjah 1447', gregorianDate: '2026-05-27', isSignificant: true,
  },
];

export default function IslamicEventsScreen(): React.JSX.Element {
  const navigation = useNavigation<EventsNavProp>();
  const [firstNode, firstRef] = useFocusDestination<TouchableHighlight>();
  const today = new Date().toISOString().split('T')[0];

  const upcoming = UPCOMING_EVENTS.filter((e) => e.gregorianDate >= today);

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
                      <Text style={styles.eventNameAr}>{item.nameAr}</Text>
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
  eventNameAr: { color: '#C9F27A', fontSize: 28, writingDirection: 'rtl', fontWeight: '600' },
  eventNameEn: { color: '#FFFFFF', fontSize: 22, marginTop: 4 },
  eventRight: { alignItems: 'flex-end' },
  eventHijri: { color: '#79C24C', fontSize: 20 },
  eventGregorian: { color: '#FFFFFF', fontSize: 22, marginTop: 4 },
  eventDaysUntil: { color: '#C9F27A', fontSize: 24, fontWeight: '700', marginTop: 4 },
});
