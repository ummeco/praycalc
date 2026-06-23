/**
 * Purpose: Base focusable element for TV D-pad navigation
 * Inputs: children, hasTVPreferredFocus, onPress, ref forwarding
 * Outputs: TouchableHighlight with correct TV focus props
 * Constraints: react-native-tvos; accessible + hasTVPreferredFocus pattern
 * SPORT: praycalc/tv components
 */

import React, { forwardRef } from 'react';
import {
  TouchableHighlight,
  TouchableHighlightProps,
  StyleSheet,
  View,
} from 'react-native';

interface TvFocusableProps extends TouchableHighlightProps {
  hasTVPreferredFocus?: boolean;
  focusedStyle?: object;
  children: React.ReactNode;
}

const TvFocusable = forwardRef<TouchableHighlight, TvFocusableProps>(
  ({ hasTVPreferredFocus, focusedStyle, children, style, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);

    return (
      <TouchableHighlight
        ref={ref}
        accessible={true}
        accessibilityRole="button"
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        underlayColor="#1E5E2F"
        style={[styles.base, style, focused && (focusedStyle ?? styles.focused)]}
        {...props}
      >
        <View>{children}</View>
      </TouchableHighlight>
    );
  }
);

TvFocusable.displayName = 'TvFocusable';

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: '#C9F27A',
    backgroundColor: '#1E5E2F',
  },
});

export default TvFocusable;
