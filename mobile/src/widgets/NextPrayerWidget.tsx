/**
 * Purpose: Android home-screen widget JSX for the "Next Prayer" widget, rendered by
 *   react-native-android-widget (native AppWidget host, NOT a normal RN screen).
 * Inputs: Next-prayer name/formatted-time/city, or null to render a "set location" state.
 * Outputs: NextPrayerWidget — JSX tree built from FlexWidget/TextWidget primitives only.
 * Constraints: Widget primitives are NOT react-native components (View/Text/StyleSheet
 *   do not work here — see FlexWidget/TextWidget from react-native-android-widget).
 *   No hooks, no theme context, no navigation — this tree is serialized to native
 *   RemoteViews by the library, so it must stay a pure, synchronous render of props.
 *   Colors are hardcoded from src/constants/colors.ts DarkColors (widgets can't reach
 *   useThemeColors()) for glanceability regardless of home-screen wallpaper.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-widget-next-prayer
 */

import * as React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

// Hardcoded from src/constants/colors.ts DarkColors — widgets cannot use hooks/context.
const WIDGET_BG = '#0D2F17'; // DarkColors.brand.deep
const WIDGET_ACCENT = '#C9F27A'; // DarkColors.brand.light / DarkColors.text.secondary
const WIDGET_TEXT = '#FFFFFF'; // DarkColors.text.inverse (on dark bg reads as primary text)
const WIDGET_MUTED = '#9CA3AF'; // DarkColors.text.muted

export interface NextPrayerWidgetProps {
  /** Next prayer name (e.g. "Fajr"), or null if location/settings are missing. */
  prayerName: string | null;
  /** Pre-formatted local time (e.g. "5:42 AM"), or null if unavailable. */
  formattedTime: string | null;
  /** City label to show under the time, or null if unavailable. */
  cityName: string | null;
}

/**
 * Root widget tree for the "NextPrayer" AppWidget. Must match the `name` given in
 * app.json's react-native-android-widget plugin config and the widgetName passed
 * to requestWidgetUpdate/renderWidget in widgetTaskHandler.ts.
 */
export function NextPrayerWidget({ prayerName, formattedTime, cityName }: NextPrayerWidgetProps) {
  const hasData = !!prayerName && !!formattedTime;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: WIDGET_BG,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'center',
        alignItems: hasData ? 'flex-start' : 'center',
      }}
      clickAction="OPEN_APP"
    >
      {hasData ? (
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <TextWidget
            text={prayerName ?? ''}
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: WIDGET_ACCENT,
              letterSpacing: 1,
            }}
          />
          <TextWidget
            text={formattedTime ?? ''}
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: WIDGET_TEXT,
              marginTop: 2,
            }}
          />
          {!!cityName && (
            <TextWidget
              text={cityName}
              truncate="END"
              maxLines={1}
              style={{
                fontSize: 12,
                color: WIDGET_MUTED,
                marginTop: 2,
              }}
            />
          )}
        </FlexWidget>
      ) : (
        <TextWidget
          text="Set your location in PrayCalc"
          maxLines={2}
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: WIDGET_ACCENT,
            textAlign: 'center',
          }}
        />
      )}
    </FlexWidget>
  );
}
