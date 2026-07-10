/**
 * useBodyScrollLock.ts — Locks page scroll while a modal/panel is open.
 *
 * PURPOSE: Prevent the background page from scrolling (and losing scroll
 *   position) while a dialog-like overlay (settings panel, Qibla modal,
 *   calendar modal) is open on top of it. Without this, an overscroll at the
 *   end of a modal's internal scroll chains to the page behind it on touch
 *   devices, and the page keeps whatever scroll position it drifted to after
 *   the modal closes.
 * INPUTS: active (boolean — scroll is locked while true).
 * OUTPUTS: none (side-effect only hook).
 * CONSTRAINTS: Client-only (guards on `typeof document`). Restores the exact
 *   prior inline `overflow` value on cleanup rather than assuming it was
 *   empty, so nested callers composing multiple locks don't clobber each
 *   other's state.
 * REF: RESP-05 (web audit gap-closure)
 */

import { useEffect } from 'react';

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [active]);
}
