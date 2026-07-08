// FILE: src/components/islands/DocsSidebar.tsx
// PURPOSE: Docs sidebar navigation island.
//   Replaces the static SidebarNav.astro with a React 19 island that:
//   - Highlights the active page link
//   - For the active page, reads DOM headings (#main-content h2[id]) and renders
//     a sub-list of section links
//   - IntersectionObserver scroll-spy highlights the current section in view
//   - Smooth-scrolls to sections on click
// INPUTS: navigation (NavGroup[]), currentPath (string)
// CONSTRAINTS:
//   - No next/* imports — plain <a> + window.location. React 19. Astro island.
//   - No framer-motion — the active-page marker and section highlight use plain
//     CSS opacity transitions (decorative only; no shared-layout FLIP needed
//     since page nav is a full reload, not a client-side transition).
// REF: Epic B-2

'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { NavGroup } from '../../lib/navigation';

interface SectionItem {
  id: string;
  text: string;
}

interface Props {
  navigation: NavGroup[];
  currentPath: string;
}

function isActive(href: string, path: string): boolean {
  if (href === '/') return path === '/' || path === '';
  // Normalize: strip trailing slash
  const normalPath = path.replace(/\/$/, '');
  const normalHref = href.replace(/\/$/, '');
  return normalPath === normalHref || normalPath.startsWith(normalHref + '/');
}

/** Heading text without the appended ".heading-anchor" link ("#"). */
function headingText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelector('.heading-anchor')?.remove();
  return clone.textContent?.trim() ?? '';
}

function readH2Sections(): SectionItem[] {
  if (typeof document === 'undefined') return [];
  const main = document.getElementById('main-content');
  if (!main) return [];
  const headings = Array.from(main.querySelectorAll('h2[id]'));
  return headings.map((el) => ({ id: el.id, text: headingText(el) }));
}

/** Scroll-spy: track which h2 sections intersect and pick the topmost visible one. */
function useActiveSection(sections: SectionItem[]) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const observers: IntersectionObserver[] = [];
    const intersecting = new Set<string>();

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              intersecting.add(id);
            } else {
              intersecting.delete(id);
            }
          });
          const ordered = sections.filter((s) => intersecting.has(s.id)).map((s) => s.id);
          if (ordered.length > 0) {
            setActiveSection(ordered[0]);
          }
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [sections]);

  return activeSection;
}

function handleSectionClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  }
}

function SectionLink({ id, text, active }: { id: string; text: string; active: boolean }) {
  return (
    <li className="relative">
      {/* Animated section highlight — CSS opacity transition (framer-motion removed) */}
      <div
        aria-hidden="true"
        className={clsx(
          'absolute inset-0 rounded-md bg-zinc-800/5 transition-opacity duration-150 dark:bg-white/5',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <a
        href={`#${id}`}
        onClick={(e) => handleSectionClick(e, id)}
        className={clsx(
          'relative block truncate py-1 pr-3 pl-7 text-sm transition-colors',
          active
            ? 'text-zinc-900 dark:text-white'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
        )}
      >
        {text}
      </a>
    </li>
  );
}

function NavLinkItem({
  link,
  active,
  sections,
  activeSection,
}: {
  link: NavGroup['links'][number];
  active: boolean;
  sections: SectionItem[];
  activeSection: string | null;
}) {
  return (
    <li className="relative">
      {/* Active page left marker — CSS opacity transition (framer-motion removed) */}
      <div
        aria-hidden="true"
        className={clsx(
          'absolute -left-2 top-1.5 h-5 w-0.5 rounded-full bg-emerald-500 transition-opacity duration-200 dark:bg-emerald-400',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />

      <a
        href={link.href}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'block rounded-md px-3 py-1.5 text-sm transition-colors',
          active
            ? 'font-medium text-zinc-900 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
        )}
      >
        {link.title}
        {link.tag && (
          <span className="ml-2 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {link.tag}
          </span>
        )}
      </a>

      {/* Section sub-list (active page only) */}
      {active && sections.length > 0 && (
        <ul>
          {sections.map(({ id, text }) => (
            <SectionLink key={id} id={id} text={text} active={activeSection === id} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function DocsSidebar({ navigation, currentPath }: Props) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const activeSection = useActiveSection(sections);

  // Read DOM headings after mount
  useEffect(() => {
    setSections(readH2Sections());
  }, [currentPath]);

  return (
    <nav aria-label="Sidebar navigation">
      <ul className="space-y-8">
        {navigation.map((group) => (
          <li key={group.title}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {group.title}
            </h3>

            <div className="relative pl-2">
              {/* Vertical rule */}
              <div className="absolute inset-y-0 left-0 w-px bg-zinc-900/10 dark:bg-white/5" />

              <ul className="space-y-0.5">
                {group.links.map((link) => (
                  <NavLinkItem
                    key={link.href}
                    link={link}
                    active={isActive(link.href, currentPath)}
                    sections={sections}
                    activeSection={activeSection}
                  />
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
