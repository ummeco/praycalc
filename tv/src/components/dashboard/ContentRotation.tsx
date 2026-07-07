/**
 * Purpose: Rotating Islamic content card (Ayah / Hadith / Dua) for the Display pane.
 *   Cycles ROTATION_ITEMS every `rotateMinutes` minutes. Renders as a translucent
 *   overlay when a stream is playing, or full-pane when the stream is off/errored.
 * Inputs: rotateMinutes (1–30), overlay flag.
 * Outputs: full-bleed content card with Arabic RTL text + citation.
 * Constraints: min 28pt glanceable text; citation always shown; timer cleaned up on
 *   unmount. Content is reused-only (see lib/content/rotationContent.ts) — no fabrication.
 * SPORT: praycalc/tv components/dashboard
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { itemForIndex } from '../../lib/content/rotationContent';
import { updateAmbientLine2 } from '../../lib/native/tvSystem';
import { buildAmbientLine2 } from '../../lib/native/ambientLines';

interface ContentRotationProps {
  /** Minutes between rotations (1–30). */
  rotateMinutes: number;
  /** True → render as a translucent overlay atop a stream; false → solid full-pane. */
  overlay: boolean;
}

export default function ContentRotation({
  rotateMinutes,
  overlay,
}: ContentRotationProps): React.JSX.Element {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const periodMs = Math.min(30, Math.max(1, rotateMinutes)) * 60 * 1000;
    const timer = setInterval(() => setIndex((i) => i + 1), periodMs);
    return () => clearInterval(timer);
  }, [rotateMinutes]);

  // Keep the native ambient (screensaver) line2 in sync with the on-screen rotation item
  // (boot + every rotation tick). Content is cited-only via buildAmbientLine2.
  useEffect(() => {
    updateAmbientLine2(buildAmbientLine2(index));
  }, [index]);

  const item = itemForIndex(index);

  return (
    <View
      style={[styles.root, overlay ? styles.overlay : styles.solid]}
      accessible={true}
      accessibilityLabel={`${item.kindLabel}. ${item.textEn}. ${item.source}`}
    >
      <View style={styles.card}>
        <Text style={styles.kindLabel}>{item.kindLabel}</Text>
        {item.titleAr ? <Text style={styles.titleAr}>{item.titleAr}</Text> : null}
        {item.titleEn ? <Text style={styles.titleEn}>{item.titleEn}</Text> : null}
        <Text style={styles.arabic}>{item.textAr}</Text>
        {item.transliteration ? (
          <Text style={styles.translit}>{item.transliteration}</Text>
        ) : null}
        <Text style={styles.english}>{item.textEn}</Text>
        <Text style={styles.source}>{item.source}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  overlay: {
    // Sits over the video — dark scrim keeps text legible against any frame.
    backgroundColor: 'rgba(13, 47, 23, 0.72)',
  },
  solid: {
    backgroundColor: '#0D2F17',
  },
  card: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
  },
  kindLabel: {
    color: '#79C24C',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  titleAr: {
    color: '#C9F27A',
    fontSize: 36,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  titleEn: {
    color: '#79C24C',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  arabic: {
    color: '#C9F27A',
    fontSize: 46,
    lineHeight: 74,
    writingDirection: 'rtl',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  translit: {
    color: '#79C24C',
    fontSize: 26,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  english: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: 20,
  },
  source: {
    color: '#79C24C',
    fontSize: 24,
    textAlign: 'center',
  },
});
