// FILE: src/components/islands/TableOfContents.tsx
// PURPOSE: Right-rail "On this page" table of contents island.
//   Reads #main-content h2[id] and h3[id] from the DOM into a nested list.
//   IntersectionObserver highlights the section currently in view.
//   h3 items are indented under their parent h2.
//   Hidden below xl viewport. If a page has <2 headings, renders nothing.
//   Smooth-scrolls to sections on click.
// INPUTS: none (reads DOM at runtime)
// CONSTRAINTS: No next/* imports. React 19. Astro island (client:load).
// REF: Epic B-2

'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function readHeadings(): HeadingItem[] {
  if (typeof document === 'undefined') return [];
  const main = document.getElementById('main-content');
  if (!main) return [];
  const els = Array.from(main.querySelectorAll('h2[id], h3[id]')) as HTMLElement[];
  return els.map((el) => ({
    id: el.id,
    text: headingText(el),
    level: el.tagName === 'H2' ? 2 : 3,
  }));
}

/** Heading text without the appended ".heading-anchor" link ("#"). */
function headingText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelector('.heading-anchor')?.remove();
  return clone.textContent?.trim() ?? '';
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const items = readHeadings();
    setHeadings(items);
  }, []);

  // IntersectionObserver scroll-spy
  useEffect(() => {
    if (headings.length === 0) return;

    const intersecting = new Set<string>();

    const observers = headings.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              intersecting.add(id);
            } else {
              intersecting.delete(id);
            }
          });
          // Activate the topmost visible heading
          const ordered = headings
            .filter((h) => intersecting.has(h.id))
            .map((h) => h.id);
          if (ordered.length > 0) {
            setActiveId(ordered[0]);
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: 0,
        },
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, [headings]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
  }

  // Fewer than 2 headings → render nothing
  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="hidden xl:block">
      <div className="sticky top-14 py-8 pl-4 pr-2">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          On this page
        </p>
        <ul className="space-y-2 text-sm">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                className={clsx(
                  'block leading-snug transition-colors',
                  level === 3 ? 'pl-3' : '',
                  activeId === id
                    ? 'font-medium text-green-700 dark:text-green-400'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
                )}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
