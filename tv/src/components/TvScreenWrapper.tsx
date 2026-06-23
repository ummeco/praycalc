/**
 * Purpose: Common screen wrapper enforcing 10-foot UI baseline for all TV screens
 * Inputs: title, children, onBack navigation callback
 * Outputs: Full-screen dark background with consistent Islamic green header
 * Constraints: min 72pt text; min 88pt touch targets; high-contrast green palette
 * SPORT: praycalc/tv components
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import TvFocusable from './TvFocusable';

interface TvScreenWrapperProps {
  title?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function TvScreenWrapper({
  title,
  children,
  showBackButton = true,
  onBack,
}: TvScreenWrapperProps): React.JSX.Element {
  return (
    <SafeAreaView style={styles.root}>
      {(title || showBackButton) && (
        <View style={styles.header}>
          {showBackButton && onBack && (
            <TvFocusable
              onPress={onBack}
              style={styles.backButton}
              hasTVPreferredFocus={false}
            >
              <Text style={styles.backText}>{'◀  Back'}</Text>
            </TvFocusable>
          )}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D2F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E5E2F',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 88,
    minHeight: 88,
    justifyContent: 'center',
  },
  backText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    color: '#C9F27A',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
});
