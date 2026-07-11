# California Privacy Rights — Counsel Draft

> **DRAFT for attorney review — not legal advice, do not publish without counsel sign-off.**
>
> This document provides draft language to resolve the four `TODO(U-15)` blocks in
> `web/src/pages/legal/california.astro`. It is structured to be dropped into that page
> verbatim (or with counsel edits) once reviewed. Do not link this page from production
> footers or remove the `noIndex` flag in `california.astro` until U-15 is closed.
>
> Tracked in: ticket U-15 · `web/src/pages/legal/california.astro` · `ADR-consent-banner-astro-gate.md`

---

## Background for Counsel

PrayCalc (`praycalc.com`) is a free prayer time calculator operated by Ummeco, LLC. Its primary
data collection is:

- **Precise geolocation** (browser Geolocation API, explicit user permission, session-only,
  not persisted server-side) — used to calculate prayer times and Qibla direction.
- **Coarse geolocation** (country/region inferred from IP, always collected as a fallback).
- **Email address** (for account holders only).
- **Subscription status** (Ummat+ members only).
- **Aggregated page analytics** (Umami, anonymized, cookie-gated behind a consent banner).

The page at `/legal/california` is a CCPA/CPRA disclosure page. It is currently `noIndex`
and carries a DRAFT banner. Four sections require counsel input before the page can go live.

---

## TODO(U-15) Block 1 — Entity Details

**Location in `california.astro`:** paragraph under the h1 "California Privacy Rights" heading.

**Current source comment:**
```
<!-- TODO(U-15): Insert full legal entity details and confirm geolocation classification
     with counsel. -->
```

**Proposed draft language** (placeholders in brackets require confirmation):

> This page describes your privacy rights under the California Consumer Privacy Rights Act
> (CPRA, as amended by Prop 24) with respect to [**LEGAL ENTITY NAME**], a [**STATE OF
> FORMATION**] limited liability company doing business as PrayCalc ("we," "us," or "our").
>
> Our principal place of business is [**STREET ADDRESS, CITY, STATE, ZIP**].
>
> For privacy inquiries: [**privacy@ummat.dev**] or [**MAILING ADDRESS**].

**Counsel confirmation needed:**
1. Confirm the correct legal entity name (Ummeco, LLC or a trade-name variant).
2. Confirm the state of formation (assumed California or Delaware — verify).
3. Confirm the mailing address for CPRA requests (or confirm email-only is sufficient for the
   disclosure, given the CPRA's flexibility for businesses under the $25M revenue threshold).
4. Confirm whether PrayCalc meets the CPRA applicability thresholds (§ 1798.140(d)(1)):
   - annual gross revenue > $25M, OR
   - buy/sell/receive/share PI of ≥ 100,000 consumers/households per year, OR
   - derive ≥ 50% of annual revenue from selling/sharing PI.
   If none of the thresholds apply, the CPRA does not technically require this page; the
   decision to publish it anyway (voluntary transparency) should be documented.

---

## TODO(U-15) Block 2 — "Do Not Sell or Share" Confirmation

**Location in `california.astro`:** paragraph inside the "Do Not Sell or Share" callout box.

**Current source comment:**
```
<!-- TODO(U-15): Confirm with counsel. -->
```

**Current draft text already in the page:**
> Ummeco, LLC does not sell personal information, including location data, to third parties.

**Proposed expansion for counsel review:**

> [**ENTITY NAME**] does not sell personal information, including location data, to third
> parties. We do not share personal information with third parties for cross-context behavioral
> advertising. We use anonymized, aggregated analytics (Umami) which does not constitute a
> "sale" or "sharing" under CPRA § 1798.140(ad) because no personal information is disclosed
> to a third party for monetary consideration or for advertising purposes.
>
> Umami analytics data is [self-hosted / hosted by Umami Cloud] and is not shared with
> advertising networks or data brokers.

**Counsel confirmation needed:**
1. Confirm that the Umami analytics configuration in use (self-hosted vs. Umami Cloud) does
   not constitute a "sale" or "sharing" under CPRA.
2. Confirm whether any third-party integrations (Stripe for Ummat+ billing, Cloudflare for
   CDN/DDoS) constitute "sharing" of PI and whether they require disclosure here.
3. If Cloudflare processes IP addresses in a way that qualifies as "sharing" under CPRA's
   broad definition, add a corresponding row to the categories table and a "service provider"
   carve-out in this section.

---

## TODO(U-15) Block 3 — Geolocation Data Categories Table

**Location in `california.astro`:** above the data categories `<table>`.

**Current source comment:**
```
<!-- TODO(U-15): Verify location data categories — precise vs coarse — with counsel. -->
```

**Current table rows (for counsel review, not exhaustive):**

| Category | Examples (current) | Collected? |
|---|---|---|
| Identifiers | Email (account), IP address | Yes |
| Precise geolocation (sensitive) | GPS coordinates used for prayer time calculation (browser API, with permission) | Yes — session only; not stored |
| Coarse geolocation | Country/region via IP (always used as fallback) | Yes |
| Internet activity | Pages viewed (aggregated analytics) | Yes — aggregated |
| Commercial information | Subscription status (Ummat+ members only) | Yes — members only |
| Inferences | No user profiles drawn from location data | No |

**Counsel confirmation needed:**
1. **Precise vs. coarse classification:** The table currently classifies browser
   Geolocation API coordinates as "precise geolocation (sensitive)" per CPRA § 1798.140(ae).
   Confirm this is correct for GPS/IP-assisted coordinates provided by the user's browser,
   even when not persisted.
2. **"Session only; not stored" claim:** Counsel should confirm whether session-only
   processing of coordinates (used for server-side prayer time calculation then discarded)
   still constitutes "collection" under CPRA § 1798.140(e) and whether the CPRA notice
   requirements apply to data processed but not retained. Our engineering position: coordinates
   are sent to the server for a single calculation and not written to any database.
3. **IP address as coarse geolocation and identifier:** IP addresses appear in two rows.
   Counsel should confirm whether this dual-listing is correct, or whether IP should appear
   only under "Identifiers."
4. **Stripe payment data:** For Ummat+ subscribers, Stripe processes payment card data.
   Confirm whether "Commercial information" should include a sub-row for payment data, or
   whether Stripe as a payment processor is excluded from the disclosure (Stripe is the
   controller of cardholder data for PCI purposes, not us).
5. **Sentry/error monitoring:** Confirm whether any error telemetry or crash-report data
   collected via Sentry (or equivalent) requires a row in this table.

---

## TODO(U-15) Block 4 — § 1798.121 Right-to-Limit Language

**Location in `california.astro`:** `<p>` inside the "Sensitive Personal Information —
Location Data" section.

**Current source comment:**
```
<!-- TODO(U-15): Confirm § 1798.121 right-to-limit language for geolocation with counsel. -->
```

**Current draft text already in the page:**
> Under CPRA § 1798.121, precise geolocation is sensitive personal information. You have the
> right to limit our use of your location data to purposes strictly necessary to provide the
> prayer time service. No additional uses apply.

**Proposed expansion for counsel review:**

> Under CPRA § 1798.121, you have the right to direct us to limit the use and disclosure of
> your sensitive personal information (including precise geolocation) to uses that are
> reasonably necessary and proportionate to provide the prayer time calculation service you
> have requested.
>
> PrayCalc uses your precise location exclusively to calculate prayer times and Qibla
> direction for your current or saved location. We do not use precise location for:
> - targeted advertising or profiling
> - sale or sharing with third parties
> - inferences about your interests, behavior, or characteristics beyond prayer-time
>   calculation
>
> Because we do not use precise geolocation for any purpose beyond service delivery,
> exercising your right to limit does not meaningfully restrict any additional use. If this
> changes, we will update this page and provide a prominent "Limit the Use of My Sensitive
> Personal Information" link as required by § 1798.135.
>
> To exercise this right, email [**privacy@ummat.dev**] with subject "CPRA Sensitive
> Information Limit Request" and include your full name and account email.

**Counsel confirmation needed:**
1. Confirm that "session-only, not persisted" precise geolocation is still within § 1798.121's
   scope and whether the right-to-limit applies or whether a carve-out applies (§ 1798.121(b)
   lists exemptions for data used to provide a requested service, which is PrayCalc's only
   use).
2. If the § 1798.121(b)(1) exemption applies (providing the service the consumer requested),
   confirm whether this page still needs a right-to-limit disclosure or whether the page is
   sufficient with a notice-only (no action button) format.
3. Confirm whether a "Limit the Use of My Sensitive Personal Information" button/link is
   required at this time, given the single-purpose use. If required, confirm the UX standard
   (link at footer? in-page only?).
4. Confirm the response timeline: current page says "45 days (extendable to 90 days with
   notice)" — verify this matches the latest CPRA regulatory guidance.

---

## Publication Checklist (for U-15 closure)

Before removing the `noIndex` flag and DRAFT banner from `california.astro`:

- [ ] Counsel has reviewed and signed off on all four TODO blocks above
- [ ] Legal entity details confirmed and inserted (Block 1)
- [ ] Umami analytics "sale/share" question resolved (Block 2)
- [ ] CPRA applicability thresholds confirmed or voluntary-publish decision documented (Block 1)
- [ ] Geolocation classification (precise vs. coarse, "session-only" scope) confirmed (Block 3)
- [ ] § 1798.121 right-to-limit language approved (Block 4) and any required button/link added
- [ ] Privacy policy at `praycalc.com/privacy` reviewed to ensure consistency with this page
- [ ] `noIndex={true}` removed from `california.astro` frontmatter
- [ ] DRAFT banner `<div>` removed from `california.astro`
- [ ] Footer link to `/legal/california` added (currently absent — intentionally, per DRAFT status)
- [ ] U-15 ticket closed
