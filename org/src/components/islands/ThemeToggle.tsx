// FILE: src/components/islands/ThemeToggle.tsx
// PURPOSE: Astro island — sun/moon button that toggles .dark on <html> and
//   persists the choice to localStorage('theme'). No next-themes dependency.
// INPUTS: none
// OUTPUTS: Accessible button that toggles light/dark mode
// CONSTRAINTS:
//   - client:load directive in parent
//   - Works alongside the no-flash inline script in Base.astro
// REF: Epic B-1

'use client';

import { useEffect, useState } from 'react';

function SunIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
      <path
        strokeLinecap="round"
        d="M10 5.5v-1M13.182 6.818l.707-.707M14.5 10h1M13.182 13.182l.707.707M10 15.5v-1M6.11 13.889l.708-.707M4.5 10h1M6.11 6.111l.708.707"
      />
    </svg>
  );
}

function MoonIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M15.224 11.724a5.5 5.5 0 0 1-6.949-6.949 5.5 5.5 0 1 0 6.949 6.949Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (isDark ? 'Switch to light theme' : 'Switch to dark theme') : 'Toggle theme'}
      aria-pressed={mounted ? isDark : undefined}
      className="flex size-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-900/5 dark:text-zinc-400 dark:hover:bg-white/5"
    >
      {/* Sun shown in dark mode (click to go light); moon in light mode */}
      <SunIcon className="hidden h-5 w-5 stroke-zinc-400 dark:block" />
      <MoonIcon className="block h-5 w-5 stroke-zinc-600 dark:hidden" />
    </button>
  );
}
