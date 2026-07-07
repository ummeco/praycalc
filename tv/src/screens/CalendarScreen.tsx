/**
 * Purpose: Screen 3 — Full Calendar Month: Hijri/Gregorian month grid, Islamic event markers
 * Inputs: Current month, Islamic events from GraphQL (pc_islamic_event)
 * Outputs: TV-sized month grid with Hijri dates and event highlights; D-pad navigation
 * Constraints: min 72pt day cells; D-pad Left/Right navigates months; hasTVPreferredFocus on today
 * SPORT: praycalc/tv screens
 */

import React, { useState } from 'react';
import { useFocusDestination } from '../hooks/useFocusDestination';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';
import { gregorianToHijri } from '../lib/hijri';

type CalendarNavProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarScreen(): React.JSX.Element {
  const navigation = useNavigation<CalendarNavProp>();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [todayNode, todayRef] = useFocusDestination<TouchableHighlight>();

  useTVEventHandler((evt) => {
    if (evt.eventType === 'left') {
      const prev = viewMonth === 0 ? { m: 11, y: viewYear - 1 } : { m: viewMonth - 1, y: viewYear };
      setViewMonth(prev.m);
      setViewYear(prev.y);
    }
    if (evt.eventType === 'right') {
      const next = viewMonth === 11 ? { m: 0, y: viewYear + 1 } : { m: viewMonth + 1, y: viewYear };
      setViewMonth(next.m);
      setViewYear(next.y);
    }
    if (evt.eventType === 'menu') navigation.goBack();
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <TvScreenWrapper title="Islamic Calendar" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        {/* Month header */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthYear}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          <Text style={styles.navHint}>◀ Prev  ▶ Next</Text>
        </View>

        {/* Day names row */}
        <View style={styles.weekRow}>
          {DAY_NAMES.map((d) => (
            <Text key={d} style={[styles.dayName, d === 'Fri' && styles.fridayName]}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <TVFocusGuideView style={styles.grid} destinations={todayNode ? [todayNode] : []}>
          {cells.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} style={styles.emptyCell} />;
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const hijri = gregorianToHijri(new Date(viewYear, viewMonth, day));
            const isFriday = new Date(viewYear, viewMonth, day).getDay() === 5;
            return (
              <TouchableHighlight
                key={day}
                ref={isToday ? todayRef : null}
                hasTVPreferredFocus={isToday}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${day} ${MONTH_NAMES[viewMonth]}, ${hijri.day} Hijri`}
                onPress={() => {}}
                underlayColor="#1E5E2F"
                style={[
                  styles.dayCell,
                  isToday && styles.dayCellToday,
                  isFriday && styles.dayCellFriday,
                ]}
              >
                <View style={styles.dayCellInner}>
                  <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{day}</Text>
                  <Text style={styles.hijriDay}>{hijri.day}</Text>
                </View>
              </TouchableHighlight>
            );
          })}
        </TVFocusGuideView>
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D2F17',
    padding: 40,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthYear: {
    color: '#C9F27A',
    fontSize: 40,
    fontWeight: '700',
  },
  navHint: {
    color: '#1E5E2F',
    fontSize: 22,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayName: {
    flex: 1,
    color: '#79C24C',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  fridayName: {
    color: '#C9F27A',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: `${100 / 7}%`,
    height: 88,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCellToday: {
    backgroundColor: '#1E5E2F',
    borderColor: '#C9F27A',
  },
  dayCellFriday: {
    borderColor: '#79C24C',
  },
  dayCellInner: {
    alignItems: 'center',
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  dayNumberToday: {
    color: '#C9F27A',
  },
  hijriDay: {
    color: '#79C24C',
    fontSize: 18,
  },
});
