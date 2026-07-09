/**
 * useFocusTrap.ts — Shared focus-trap hook for modal/dialog islands.
 *
 * PURPOSE: While a dialog is active, (1) move focus to its first focusable
 *   element on mount, (2) trap Tab/Shift+Tab cycling within the dialog so focus
 *   never escapes to the page behind it, and (3) restore focus to whatever was
 *   focused before the dialog opened once it unmounts/deactivates.
 * INPUTS: active (boolean — trap runs while true), externalRef (optional ref to
 *   merge in, e.g. a caller that also needs the DOM node for outside-click
 *   detection, like CityClient's SettingsPanel panelRef).
 * OUTPUTS: a ref-callback to attach to the dialog's root element.
 * CONSTRAINTS: WCAG 2.1 AA (focus management for dialogs). Query-based focusable
 *   list is re-evaluated per Tab press (cheap, avoids stale-ref bugs when a
 *   dialog's content changes while open, e.g. CalendarModal view switches).
 * REF: P2-PRAYCALC-WEB-GAPS-100
 */

import { useCallback, useEffect, useRef, type MutableRefObject, type Ref } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  externalRef?: Ref<T>,
): (node: T | null) => void {
  const nodeRef = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Merge our internal ref with any externally-supplied ref/callback so callers
  // that also need the DOM node (e.g. outside-click detection) keep working.
  const setRef = useCallback(
    (node: T | null) => {
      nodeRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef) {
        (externalRef as MutableRefObject<T | null>).current = node;
      }
    },
    [externalRef],
  );

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = nodeRef.current;
    const focusables = () =>
      container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    // Move focus into the dialog on open.
    const first = focusables()[0];
    (first ?? container)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Restore focus to whatever was focused before the dialog opened.
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return setRef;
}
