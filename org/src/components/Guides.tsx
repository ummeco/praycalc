import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const guides = [
  {
    href: '/science/solar-position',
    name: 'Solar Position & NREL SPA',
    description:
      'How the NREL SPA algorithm computes Sun position with sub-arcsecond accuracy over a 2,000-year window.',
  },
  {
    href: '/science/twilight-angles',
    name: 'Twilight Science',
    description:
      'What happens optically as the Sun dips below the horizon and why depression angles define Islamic dawn and night.',
  },
  {
    href: '/science/calculation-methods',
    name: 'Prayer Calculation Methods',
    description:
      'The 14+ traditional fixed-angle methods — ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi — and how they compare.',
  },
  {
    href: '/science/dynamic-vs-fixed',
    name: 'Dynamic vs. Fixed Angles',
    description:
      'Physics-grounded adaptive twilight angles for any latitude and season, backed by 4,000+ empirical observations.',
  },
]

export function Guides() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="science">
        The Science
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {guides.map((guide) => (
          <div key={guide.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {guide.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {guide.description}
            </p>
            <p className="mt-4">
              <Button href={guide.href} variant="text" arrow="right">
                Read more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
