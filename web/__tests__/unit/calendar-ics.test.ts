import { describe, it, expect } from "vitest";
import { GET } from "@/pages/api/calendar.ics";

// ---------------------------------------------------------------------------
// The calendar.ics GET handler only reads `url.searchParams`, so a plain URL in
// a minimal context is enough to exercise it end-to-end (real pray-calc + hijri
// engines run — no network). We use a wide `days` window so the fixed Islamic
// observances are guaranteed to fall inside the export range.
// ---------------------------------------------------------------------------
async function callIcs(query: string): Promise<{ status: number; body: string }> {
  const url = new URL(`https://praycalc.com/api/calendar.ics?${query}`);
  const res = await GET({ url } as unknown as Parameters<typeof GET>[0]);
  return { status: res.status, body: await res.text() };
}

// Conneaut, OH — praycalc's default fixture location.
const BASE = "lat=41.5565&lng=-80.5595&tz=America%2FNew_York&days=365";

describe("GET /api/calendar.ics", () => {
  it("400s on missing coordinates", async () => {
    const { status } = await callIcs("tz=UTC");
    expect(status).toBe(400);
  });

  it("returns a valid VCALENDAR of prayer VEVENTs by default", async () => {
    const { status, body } = await callIcs(`${BASE}&days=3`);
    expect(status).toBe(200);
    expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(body.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(body).toContain("SUMMARY:Fajr Prayer");
  });

  it("does NOT include Islamic events unless events=1 (opt-in, backward compatible)", async () => {
    const { body } = await callIcs(`${BASE}&days=365`);
    expect(body).not.toContain("SUMMARY:Eid al-Fitr");
    expect(body).not.toContain("CATEGORIES:Islamic Holiday");
  });

  it("appends all-day Islamic-event VEVENTs when events=1", async () => {
    const { status, body } = await callIcs(`${BASE}&events=1`);
    expect(status).toBe(200);
    // All-day events use DATE value type (no time component).
    expect(body).toMatch(/DTSTART;VALUE=DATE:\d{8}/);
    expect(body).toContain("CATEGORIES:Islamic Holiday");
    // At least the two Eids and Ramadan appear within a full-year window.
    expect(body).toContain("SUMMARY:Eid al-Fitr");
    expect(body).toContain("SUMMARY:Eid al-Adha");
    expect(body).toContain("SUMMARY:First day of Ramadan");
  });

  it("never exports Mawlid among the Islamic events", async () => {
    const { body } = await callIcs(`${BASE}&events=1`);
    expect(body.toLowerCase()).not.toContain("mawlid");
  });

  it("passes ICS structural validation (balanced VEVENT begin/end, CRLF lines)", async () => {
    const { body } = await callIcs(`${BASE}&days=30&events=1`);
    const begins = (body.match(/BEGIN:VEVENT/g) ?? []).length;
    const ends = (body.match(/END:VEVENT/g) ?? []).length;
    expect(begins).toBe(ends);
    expect(begins).toBeGreaterThan(0);
    expect(body).toContain("\r\n"); // RFC 5545 CRLF line endings
  });
});

// ---------------------------------------------------------------------------
// P12-E01-T04 — the feed is anchored on the SUBSCRIBER's calendar day.
// It previously started from the server's UTC day, so a subscriber far from UTC
// got a feed beginning on the wrong date. An ICS feed is subscribed once and
// re-fetched for months, so that error persisted silently in their calendar app.
// ---------------------------------------------------------------------------
describe("calendar.ics — subscriber's calendar day", () => {
  /** The day a zone is on right now, via Intl — an independent oracle. */
  function oracleToday(tz: string): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
  }

  it('starts on the subscriber\'s day, not the server\'s UTC day', async () => {
    for (const tz of ['Pacific/Auckland', 'Pacific/Honolulu', 'Asia/Tokyo', 'UTC']) {
      const { status, body } = await callIcs(
        `lat=21.3891&lng=39.8579&tz=${encodeURIComponent(tz)}&days=3`,
      );
      expect(status).toBe(200);

      // DTSTART is emitted as a UTC instant (correct ICS), so its printed date is the UTC
      // date, NOT the subscriber's. Resolve each instant back into the subscriber's zone
      // before comparing — comparing the printed date against a local day is precisely the
      // frame-mixing mistake this whole ticket exists to fix.
      const instants = [...body.matchAll(/DTSTART:(\d{8})T(\d{6})Z/g)].map((m) => {
        const d = m[1] as string;
        const t = m[2] as string;
        return new Date(
          `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` +
            `T${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}Z`,
        );
      });
      expect(instants.length, `${tz} produced no timed events`).toBeGreaterThan(0);

      const localDays = instants
        .map((at) =>
          new Intl.DateTimeFormat('en-CA', {
            timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
          }).format(at),
        )
        .sort();

      expect(localDays[0], `${tz} feed start`).toBe(oracleToday(tz));
    }
  });

  it('rejects an unusable tz with 400, not an uncaught throw', async () => {
    // The day anchor and the offset both parse tz, so the guard has to run before either.
    for (const bad of ['Not/AZone', '99']) {
      const { status } = await callIcs(`lat=21.3891&lng=39.8579&tz=${encodeURIComponent(bad)}&days=2`);
      expect(status, `tz=${bad}`).toBe(400);
    }
  });
});
