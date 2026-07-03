/**
 * Focus destination for TVFocusGuideView.
 *
 * `destinations` needs mounted component instances (react-native-tvos feeds
 * each entry through findNodeHandle), not RefObjects — a RefObject both fails
 * the prop's type and silently no-ops at runtime. This hook exposes the
 * mounted node via state (so the guide re-renders once the target exists)
 * plus a callback ref to attach to the target element.
 *
 * Usage:
 *   const [firstNode, firstRef] = useFocusDestination<TouchableHighlight>();
 *   <TVFocusGuideView destinations={firstNode ? [firstNode] : []}>
 *     <TouchableHighlight ref={index === 0 ? firstRef : null} ... />
 */
import { useCallback, useState } from 'react';

export function useFocusDestination<T>(): [T | null, (node: T | null) => void] {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((n: T | null) => setNode(n), []);
  return [node, ref];
}
