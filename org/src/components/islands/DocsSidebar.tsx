// FILE: src/components/islands/DocsSidebar.tsx
// PURPOSE: Animated docs sidebar navigation island.
//   Replaces the static SidebarNav.astro with a React 19 island that:
//   - Highlights the active page link
//   - For the active page, reads DOM headings (#main-content h2[id]) and renders
//     a sub-list with animated appear/disappear (AnimatePresence)
//   - IntersectionObserver scroll-spy highlights the current section in view
//     using a framer-motion layoutId indicator
//   - Smooth-scrolls to sections on click
// INPUTS: navigation (NavGroup[]), currentPath (string)
// CONSTRAINTS: No next/* imports — plain <a> + window.location. React 19. Astro island.
// REF: Epic B-2

'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

function readH2Sections(): SectionItem[] {
  if (typeof document === 'undefined') return [];
  const main = document.getElementById('main-content');
  if (!main) return [];
  const headings = Array.from(main.querySelectorAll('h2[id]'));
  return headings.map((el) => ({
    id: el.id,
    text: headingText(el),
  }));
}

/** Heading text without the appended ".heading-anchor" link ("#"). */
function headingText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelector('.heading-anchor')?.remove();
  return clone.textContent?.trim() ?? '';
}

export default function DocsSidebar({ navigation, currentPath }: Props) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Read DOM headings after mount
  useEffect(() => {
    const items = readH2Sections();
    setSections(items);
  }, [currentPath]);

  // IntersectionObserver scroll-spy on h2 headings
  useEffect(() => {
    if (sections.length === 0) return;

    const observers: IntersectionObserver[] = [];
    // Track which sections are currently intersecting
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
          // Pick the topmost visible section
          const ordered = sections
            .filter((s) => intersecting.has(s.id))
            .map((s) => s.id);
          if (ordered.length > 0) {
            setActiveSection(ordered[0]);
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: 0,
        },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [sections]);

  function handleSectionClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
  }

  return (
    <nav aria-label="Sidebar navigation">
      <ul className="space-y-8">
        {navigation.map((group) => {
          return (
            <li key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {group.title}
              </h3>

              <div className="relative pl-2">
                {/* Vertical rule */}
                <div className="absolute inset-y-0 left-0 w-px bg-zinc-900/10 dark:bg-white/5" />

                <ul className="space-y-0.5">
                  {group.links.map((link) => {
                    const active = isActive(link.href, currentPath);

                    return (
                      <li key={link.href} className="relative">
                        {/* Active page left marker */}
                        <AnimatePresence initial={false}>
                          {active && (
                            <motion.div
                              layoutId="active-page-marker"
                              className="absolute -left-2 top-1.5 h-5 w-0.5 rounded-full bg-green-600 dark:bg-green-500"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </AnimatePresence>

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
                        <AnimatePresence initial={false} mode="popLayout">
                          {active && sections.length > 0 && (
                            <motion.ul
                              role="list"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{
                                opacity: 1,
                                height: 'auto',
                                transition: { duration: 0.2, delay: 0.05 },
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                                transition: { duration: 0.15 },
                              }}
                              className="overflow-hidden"
                            >
                              {sections.map(({ id, text }) => {
                                const sectionActive = activeSection === id;
                                return (
                                  <li key={id} className="relative">
                                    {/* Animated section highlight */}
                                    <AnimatePresence initial={false}>
                                      {sectionActive && (
                                        <motion.div
                                          layoutId="active-section-bg"
                                          className="absolute inset-0 rounded-md bg-zinc-800/5 dark:bg-white/5"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          transition={{ duration: 0.15 }}
                                        />
                                      )}
                                    </AnimatePresence>
                                    <a
                                      href={`#${id}`}
                                      onClick={(e) => handleSectionClick(e, id)}
                                      className={clsx(
                                        'relative block truncate py-1 pr-3 pl-7 text-sm transition-colors',
                                        sectionActive
                                          ? 'text-zinc-900 dark:text-white'
                                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
                                      )}
                                    >
                                      {text}
                                    </a>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
