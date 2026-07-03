/**
 * Purpose: TypeScript augmentation for react-native-tvos TV props on Touchables
 * Inputs: react-native-tvos runtime (hasTVPreferredFocus / isTVSelectable)
 * Outputs: Typed TV focus props on Touchable* components
 * Constraints: react-native-tvos 0.74 ships real TV types
 *   (types/public/ReactNativeTVTypes.d.ts) covering TVFocusGuideView,
 *   useTVEventHandler/HWEvent and the View-level TV props — do NOT redeclare
 *   those here (an earlier shim typed TVFocusGuideView.destinations as
 *   RefObject[], contradicting the real Component/handle typing and hiding a
 *   runtime no-op). Only the Touchable*Props additions below are missing
 *   upstream.
 */

import 'react-native';

declare module 'react-native' {
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
