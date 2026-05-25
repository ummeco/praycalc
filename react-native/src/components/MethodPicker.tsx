/**
 * Purpose: Dropdown-style picker for selecting the prayer calculation method.
 * Inputs: current CalcMethodId, onSelect callback
 * Outputs: Rendered list of method options with active highlight
 * Constraints: Pure presentational. No async, no storage — parent handles persistence.
 * SPORT: components/MethodPicker.tsx
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import type { CalcMethodId } from '../types';

const METHODS: Array<{ id: CalcMethodId; label: string; region: string }> = [
  { id: 'dynamic', label: 'Dynamic (Physics)', region: 'Recommended — adapts to latitude/season' },
  { id: 'isna', label: 'ISNA', region: 'Islamic Society of North America' },
  { id: 'mwl', label: 'MWL', region: 'Muslim World League' },
  { id: 'egypt', label: 'Egyptian', region: 'Egyptian General Authority of Survey' },
  { id: 'makkah', label: 'Umm Al-Qura', region: 'Makkah (Saudi Arabia)' },
  { id: 'karachi', label: 'Karachi', region: 'University of Islamic Sciences, Karachi' },
  { id: 'tehran', label: 'Tehran', region: 'Institute of Geophysics, Tehran' },
  { id: 'jafari', label: "Jafari", region: "Shia Ithna Ashari (Jafari)" },
];

interface MethodPickerProps {
  value: CalcMethodId;
  onSelect: (method: CalcMethodId) => void;
}

export const MethodPicker: React.FC<MethodPickerProps> = ({ value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const current = METHODS.find((m) => m.id === value);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <View>
          <Text style={styles.triggerLabel}>Calculation Method</Text>
          <Text style={styles.triggerValue}>{current?.label ?? value}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calculation Method</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.row, m.id === value && styles.rowActive]}
                onPress={() => { onSelect(m.id); setOpen(false); }}
              >
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, m.id === value && styles.rowLabelActive]}>{m.label}</Text>
                  <Text style={styles.rowRegion}>{m.region}</Text>
                </View>
                {m.id === value && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
  },
  triggerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  triggerValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '90deg' }],
  },
  modal: {
    flex: 1,
    backgroundColor: '#0f2418',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  done: {
    fontSize: 16,
    color: '#34a853',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  rowActive: {
    backgroundColor: 'rgba(52,168,83,0.12)',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  rowLabelActive: {
    color: '#34a853',
    fontWeight: '700',
  },
  rowRegion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  check: {
    fontSize: 18,
    color: '#34a853',
    fontWeight: '700',
  },
});
