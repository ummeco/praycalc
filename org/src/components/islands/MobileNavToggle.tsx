// FILE: src/components/islands/MobileNavToggle.tsx
// PURPOSE: Astro island — mobile navigation drawer toggle.
//   Renders ONLY a hamburger button in the header; opening it shows a full-screen
//   overlay drawer (Protocol mobile-nav style). The site header already provides
//   the top bar + logo, so this no longer renders its own header row.
// INPUTS: navigation (NavGroup[]), currentPath (string)
// OUTPUTS: Accessible hamburger trigger + full-screen overlay nav drawer
// CONSTRAINTS:
//   - client:load — hydrates immediately for mobile UX
//   - No framer-motion; CSS transitions only for bundle size
//   - Focus trap: Tab/Shift+Tab cycle within the open panel only; focus moves
//     into the panel on open and returns to the trigger button on close.
// REF: T-01 (P2-E3-W01-S01) · D-P2-REACT19 · Protocol re-skin (MobileNavigation.tsx)

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { NavGroup } from '../../lib/navigation';

interface Props {
  navigation: NavGroup[];
  currentPath: string;
}

function isActive(href: string, path: string): boolean {
  if (href === '/') return path === '/' || path === '';
  return path === href || path.startsWith(href + '/');
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNavToggle({ navigation, currentPath }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape; focus trap for Tab/Shift+Tab within the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Move focus into the panel on open; restore it to the trigger on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Defer to the next tick so the portalled panel exists in the DOM.
      const id = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    previouslyFocused.current?.focus();
    previouslyFocused.current = null;
  }, [open]);

  return (
    <>
      {/* Hamburger button — sits in the site header */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Full-screen overlay drawer — portalled to <body> so the sticky header's
          backdrop-blur (which forms a containing block for `fixed`) can't trap it. */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          id="mobile-nav"
          ref={panelRef}
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-white px-5 pb-8 pt-4 ring-1 ring-zinc-900/10 dark:bg-zinc-900 dark:ring-white/10">
            <div className="flex items-center justify-between">
              <a
                href="/"
                className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"
                onClick={() => setOpen(false)}
              >
                <span>PrayCalc</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.7rem] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  docs
                </span>
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="mt-6">
              <ul className="space-y-7">
                {navigation.map((group) => (
                  <li key={group.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {group.title}
                    </p>
                    <div className="relative pl-2">
                      <div className="absolute inset-y-0 left-0 w-px bg-zinc-900/10 dark:bg-white/10" />
                      <ul className="space-y-0.5">
                        {group.links.map((link) => {
                          const active = isActive(link.href, currentPath);
                          return (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => setOpen(false)}
                                className={[
                                  'block rounded-md px-3 py-1.5 text-sm transition-colors',
                                  active
                                    ? 'font-medium text-emerald-700 dark:text-emerald-400'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
                                ].join(' ')}
                              >
                                {link.title}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
