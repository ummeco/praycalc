/**
 * FILE:        praycalc/org/src/i18n/ui/en.ts
 * PURPOSE:     English (default) UI string translations for praycalc.org docs site.
 * REF:         P2-E6-W01-S01-T01 AC-01
 */

export const en = {
  site: {
    name: 'PrayCalc',
    tagline: 'Prayer Time Documentation',
    description: 'Scientific documentation for PrayCalc — solar physics, twilight optics, orbital mechanics, and npm packages for Islamic prayer time calculation.',
    badge: 'docs',
  },
  nav: {
    skipToContent: 'Skip to main content',
    docsLabel: 'Documentation navigation',
    mobileMenuLabel: 'Open navigation menu',
    mobileMenuClose: 'Close navigation menu',
    backToTop: 'Back to top',
  },
  sections: {
    gettingStarted: 'Getting Started',
    features: 'Features',
    theScience: 'The Science',
    theResearch: 'The Research',
    packages: 'Packages',
    advanced: 'Advanced',
  },
  links: {
    introduction: 'Introduction',
    installation: 'Installation',
    pwa: 'Progressive Web App',
    i18n: 'Internationalization',
    calendarExport: 'PDF Calendar Export',
    solarPosition: 'Solar Position & NREL SPA',
    twilightAngles: 'Twilight & Depression Angles',
    axialTilt: "Earth's Axial Tilt",
    ellipticalOrbit: 'Elliptical Orbit',
    atmosphericRefraction: 'Atmospheric Refraction',
    calculationMethods: 'Calculation Methods',
    qiblaDirection: 'Qibla Direction',
    dynamicVsFixed: 'Dynamic vs. Fixed Angles',
    empiricalStudies: 'Research & Empirical Studies',
    globalAngles: 'Global Angle Tables',
    methodComparison: 'Method Comparison',
    machineLearning: 'Machine Learning',
    hijriCalendar: 'Hijri Calendar Systems',
  },
  footer: {
    openSource: 'Open Source',
    islamicTech: 'Islamic Technology',
    viewOnGitHub: 'View on GitHub',
    copyright: '© PrayCalc. Open-source Islamic technology.',
  },
} as const
