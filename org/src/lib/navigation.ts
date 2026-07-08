// FILE: src/lib/navigation.ts
// PURPOSE: Sidebar navigation tree for praycalc.org docs.
//   Single source of truth for all nav groups and links.
//   Consumed by SidebarNav.astro (static) and MobileNavToggle (island).
// REF: T-01 (P2-E3-W01-S01)

export interface NavLink {
  title: string;
  href: string;
  tag?: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export const navigation: NavGroup[] = [
  {
    title: 'Getting Started',
    links: [
      { title: 'Introduction', href: '/' },
      { title: 'How DPC Works', href: '/how-dpc-works' },
      { title: 'Installation', href: '/installation' },
    ],
  },
  {
    title: 'Features',
    links: [
      { title: 'Progressive Web App', href: '/features/pwa' },
      { title: 'Internationalization', href: '/features/i18n' },
      { title: 'PDF Calendar Export', href: '/features/calendar-export' },
    ],
  },
  {
    title: 'Platforms',
    links: [
      { title: 'Desktop App', href: '/features/desktop' },
      { title: 'Watch Apps', href: '/features/watch' },
      { title: 'TV Display Mode', href: '/features/tv-display' },
      { title: 'Smart Home Integration', href: '/features/smart-home' },
      { title: 'REST API', href: '/features/api' },
    ],
  },
  {
    title: 'The Science',
    links: [
      { title: 'Solar Position & NREL SPA', href: '/science/solar-position' },
      { title: 'Twilight & Depression Angles', href: '/science/twilight-angles' },
      { title: "Earth's Axial Tilt", href: '/science/axial-tilt' },
      { title: 'Elliptical Orbit', href: '/science/elliptical-orbit' },
      { title: 'Atmospheric Refraction', href: '/science/atmospheric-refraction' },
      { title: 'Calculation Methods', href: '/science/calculation-methods' },
      { title: 'Qibla Direction', href: '/science/qibla-calculation' },
      { title: 'Dynamic vs. Fixed Angles', href: '/science/dynamic-vs-fixed' },
    ],
  },
  {
    title: 'The Research',
    links: [
      { title: 'Research & Empirical Studies', href: '/research/empirical-studies' },
      { title: 'Global Angle Tables', href: '/research/global-angles' },
      { title: 'Method Comparison', href: '/research/method-comparison' },
    ],
  },
  {
    title: 'Packages',
    links: [
      { title: 'pray-calc', href: '/packages/pray-calc' },
      { title: 'nrel-spa', href: '/packages/nrel-spa' },
      { title: 'moon-sighting', href: '/packages/moon-sighting' },
      { title: 'moon-cycle', href: '/packages/moon-cycle' },
      { title: 'hijri-core', href: '/packages/hijri-core' },
      { title: 'luxon-hijri', href: '/packages/luxon-hijri' },
    ],
  },
  {
    title: 'Advanced',
    links: [
      { title: 'Machine Learning', href: '/ml' },
      { title: 'Hijri Calendar Systems', href: '/hijri' },
    ],
  },
];
