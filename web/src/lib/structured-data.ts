/**
 * structured-data.ts — schema.org JSON-LD builders for PrayCalc SEO.
 *
 * PURPOSE: Central, typed builders for the JSON-LD emitted across the 235k-city
 *   SEO site — Organization, WebApplication, Place, BreadcrumbList, FAQPage.
 *   Keeping them here means every page emits consistent, valid structured data
 *   and the site name/URL live in one place.
 * INPUTS: page-specific values (city name, coordinates, breadcrumb trail, FAQs).
 * OUTPUTS: plain JSON-serializable objects passed to RootLayout's `jsonLd` prop.
 * CONSTRAINTS: No server-only imports — safe to import from .astro frontmatter.
 *   Never fabricate ratings/prices; only structural + factual fields are emitted.
 * REF: W1.1 (JSON-LD structured data, gap B13)
 */

export const SITE_URL = 'https://praycalc.com';
export const SITE_NAME = 'PrayCalc';

/** schema.org Organization for PrayCalc — reused as `publisher`/`provider`. */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description:
      'PrayCalc provides accurate Islamic prayer times for any location on Earth, using a physics-grounded dynamic calculation method.',
  };
}

/**
 * schema.org WebApplication for the PrayCalc app (home page). Free, browser-based
 * utility. `offers` at price 0 states the app is free without inventing ratings.
 */
export function webApplicationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript.',
    description:
      'Accurate Islamic prayer times for any city on Earth — GPS-based, dynamic and traditional calculation methods, Qibla direction, moon phases, and the Hijri calendar.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * schema.org Place for a city page — the location prayer times are computed for.
 * Emitted alongside a BreadcrumbList so search engines understand the geography.
 */
export function placeSchema(name: string, lat: number, lng: number, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    url,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    },
  };
}

/** A single breadcrumb item (name + absolute URL). */
export interface Crumb {
  name: string;
  url: string;
}

/** schema.org BreadcrumbList from an ordered list of {name, url} crumbs. */
export function breadcrumbSchema(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** A single FAQ entry. */
export interface Faq {
  question: string;
  answer: string;
}

/** schema.org FAQPage from an ordered list of question/answer pairs. */
export function faqPageSchema(faqs: Faq[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
