# ADR: Monetization — PrayCalc Free Forever; Ummat+ for Consumers, Ummat Pro for Businesses

- Status: Accepted
- Date: 2026-08-31
- Supersedes: the 2026-08-31 draft titled "Ummat+ Is the Only Paid Product",
  which was wrong. Corrected same day on owner clarification before it was
  committed.

## Context

P13-E01-T05 recorded the monetization intent so future builders would stop
re-deriving it. The first draft said "the only paid product anywhere in Ummeco
is an Ummat+ account". That came from the phase plan's OD-7 wording and it is
not accurate: it collapsed two separate revenue lines into one.

## Decision

There are TWO paid products. They serve different customers and must not be
conflated.

1. **PrayCalc is free forever.** It is never the thing that makes money. No
   PrayCalc-specific Stripe account, ever.

2. **Ummat+ — the CONSUMER membership.** One membership that unlocks premium
   features across the whole consumer ecosystem: Ummat App, PrayCalc,
   IslamWiki, and the rest. A user buys it once and it applies everywhere.
   Prior reference pricing: $9.99/yr (Pro Tier Matrix v1, 2026-04-27) — verified
   badge, ad-free, priority support, ecosystem perks.

3. **Ummat Pro — the BUSINESS/ENTITY product.** Tiered subscriptions for
   masjids, charities and imams: entity listing, widgets, newsletters,
   donations, signage, governance and so on. Gated by `CAPABILITY_MAP` in
   `ummat/pro/web/src/lib/pro_can.ts`.

4. **One Stripe account** — the Ummat account (Stripe Connect, per the PPI) —
   serves both. Never a per-app Stripe.

5. PrayCalc's billing scaffolding is the client side of a future **Ummat+**
   entitlement check. It holds no Stripe keys and correctly degrades to
   "launching soon" until Ummat+ ships on the shared backend.

## Open, and deliberately not decided here

The Ummat Pro tier ladder ABOVE `verified` is not finalized. The Pro Tier
Matrix v1 scoped P3 to `FREE-CLAIM` ($0) and `VERIFIED` ($9/yr) only, deferred
everything above them, and said plainly: "HIGHER tier name and pricing — not
finalized". Its DB enum is `('free_claim', 'verified', 'higher')`.

The tier NAMES are in fact settled: `pro/web/src/lib/billing-config.ts` is the
declared SSOT per D-P4-01 (named as such by the Pro PAI) and gives
`verified` $299 · `growth` $599 · `pro` $999 · `enterprise` $2499.

What is NOT settled is the capability-to-tier mapping. `CAPABILITY_MAP` in
`pro_can.ts` uses a `standard` tier that does not exist in the SSOT, and its
groupings disagree with what each price is sold as (events, signage, donations
and API access all sit at different levels than billing-config advertises).

That taxonomy needs one deliberate decision. Tracked at
`ummat/.claude/ideas/ummat-pro-tier-taxonomy.md`. It is an entitlements-and-money
question, so it is not settled inside a test fix.

## Consequences

- PrayCalc never grows its own paywall or Stripe account.
- Consumer premium work belongs to Ummat+ on the shared backend.
- Business/entity monetization belongs to Ummat Pro and its capability map.
- Anyone reading only the superseded draft would wrongly conclude Ummat Pro has
  no paid tiers. It does.
