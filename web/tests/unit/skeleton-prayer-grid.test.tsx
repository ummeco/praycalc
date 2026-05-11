/**
 * FILE: tests/unit/skeleton-prayer-grid.test.tsx
 * PURPOSE: Regression test for T-P7-C-S11-10. The prayer-grid skeleton
 *   wrapper MUST NOT carry aria-hidden and MUST expose an aria-live
 *   region so screen readers announce loading state.
 * OWNER: PrayCalc UI / a11y
 * INVARIANTS:
 *   - Wrapper element must not have aria-hidden="true".
 *   - Wrapper element must expose role="status" + aria-live="polite".
 *   - Wrapper element must carry an aria-label describing the load.
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SkeletonPrayerGrid from "@/components/SkeletonPrayerGrid";

describe("SkeletonPrayerGrid a11y (T-P7-C-S11-10)", () => {
  const html = renderToStaticMarkup(<SkeletonPrayerGrid />);

  it("does not aria-hide the loading wrapper", () => {
    // Match the outer wrapper opening tag only.
    const wrapperMatch = html.match(/<div class="skeleton-prayer-grid"[^>]*>/);
    expect(wrapperMatch, "skeleton wrapper must render").toBeTruthy();
    expect(wrapperMatch![0]).not.toMatch(/aria-hidden=("|')true/);
  });

  it("exposes role=status with polite live region", () => {
    expect(html).toMatch(/role="status"/);
    expect(html).toMatch(/aria-live="polite"/);
    expect(html).toMatch(/aria-busy="true"/);
  });

  it("labels the loading state", () => {
    expect(html).toMatch(/aria-label="Loading prayer times"/);
  });

  it("keeps decorative inner rows hidden from AT", () => {
    // Inner rows are decorative and may keep aria-hidden.
    expect(html).toMatch(/skeleton-prayer-row[^"]*"\s+aria-hidden="true"/);
  });
});
