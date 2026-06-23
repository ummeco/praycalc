/**
 * Purpose: TypeScript augmentation for react-native-tvos TV-specific APIs
 * Inputs: react-native-tvos runtime APIs (TVFocusGuideView, useTVEventHandler, hasTVPreferredFocus)
 * Outputs: Typed declarations allowing TS to compile TV-specific props
 * Constraints: react-native-tvos ships JS but no separate .d.ts for TV-specific APIs
 */

import 'react-native';

declare module 'react-native' {
  /**
   * TV event types reported by useTVEventHandler
   */
  interface TVRemoteEvent {
    eventType:
      | 'up'
      | 'down'
      | 'left'
      | 'right'
      | 'select'
      | 'menu'
      | 'playPause'
      | 'longSelect'
      | 'swipeUp'
      | 'swipeDown'
      | 'swipeLeft'
      | 'swipeRight'
      | string;
    eventKeyAction?: number;
    tag?: number;
    body?: Record<string, unknown>;
  }

  /**
   * useTVEventHandler — fires on Apple TV remote events
   * Imported from 'react-native' in react-native-tvos builds
   */
  function useTVEventHandler(handler: (evt: TVRemoteEvent) => void): void;

  /**
   * TVFocusGuideView — directs D-pad focus to a set of destination refs
   */
  interface TVFocusGuideViewProps extends ViewProps {
    destinations?: React.RefObject<unknown>[];
    enabled?: boolean;
    trapFocusLeft?: boolean;
    trapFocusRight?: boolean;
    trapFocusUp?: boolean;
    trapFocusDown?: boolean;
  }

  const TVFocusGuideView: React.ComponentType<TVFocusGuideViewProps>;

  /**
   * hasTVPreferredFocus — added to all Touchable and View components in tvos builds
   */
  interface ViewProps {
    hasTVPreferredFocus?: boolean;
    isTVSelectable?: boolean;
  }

  interface TouchableHighlightProps {
    hasTVPreferredFocus?: boolean;
    isTVSelectable?: boolean;
  }

  interface TouchableOpacityProps {
    hasTVPreferredFocus?: boolean;
    isTVSelectable?: boolean;
  }

  interface TouchableWithoutFeedbackProps {
    hasTVPreferredFocus?: boolean;
    isTVSelectable?: boolean;
  }
}
