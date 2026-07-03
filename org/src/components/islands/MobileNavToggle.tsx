// FILE: src/components/islands/MobileNavToggle.tsx
// PURPOSE: Astro island — mobile navigation drawer toggle.
//   Client-side React 19 component that renders a hamburger button
//   and slide-out nav drawer for mobile viewports.
// INPUTS: navigation (NavGroup[]), currentPath (string)
// OUTPUTS: Accessible mobile nav trigger + drawer
// CONSTRAINTS:
//   - client:load directive — hydrates immediately for mobile UX
//   - No framer-motion; CSS transitions only for bundle size
// REF: T-01 (P2-E3-W01-S01) · D-P2-REACT19

'use client';

import { useState } from 'react';
import type { NavGroup } from '../../lib/navigation';

interface Props {
  navigation: NavGroup[];
  currentPath: string;
}

function isActive(href: string, path: string): boolean {
  if (href === '/') return path === '/' || path === '';
  return path === href || path.startsWith(href + '/');
}

export default function MobileNavToggle({ navigation, currentPath }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile header bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <a href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
          <span>PrayCalc</span>
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            docs
          </span>
        </a>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {open ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="border-b border-zinc-200 bg-white px-4 pb-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <nav aria-label="Mobile navigation">
            <ul className="space-y-6 pt-4">
              {navigation.map((group) => (
                <li key={group.title}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {group.title}
                  </p>
                  <ul className="space-y-1">
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
                                ? 'bg-green-50 font-medium text-green-800 dark:bg-green-950 dark:text-green-300'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white',
                            ].join(' ')}
                          >
                            {link.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
