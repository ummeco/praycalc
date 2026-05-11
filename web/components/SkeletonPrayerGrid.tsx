/**
 * FILE: components/SkeletonPrayerGrid.tsx
 * PURPOSE: Skeleton loader for the prayer times grid (a11y-friendly).
 * OWNER: PrayCalc UI
 * INVARIANTS:
 *   - The skeleton MUST be announced to assistive tech via aria-live="polite".
 *   - The skeleton MUST NOT use aria-hidden (T-P7-C-S11-10).
 * DO NOT:
 *   - Re-add aria-hidden to the wrapper.
 *   - Convert decorative skeleton bars into focusable elements.
 * Uses CSS classes from globals.css (PC-1.11).
 */
export default function SkeletonPrayerGrid() {
  const rows = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  return (
    <div
      className="skeleton-prayer-grid"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading prayer times"
    >
      <span className="sr-only">Loading prayer times</span>
      {rows.map((name) => (
        <div key={name} className="skeleton-prayer-row" aria-hidden="true">
          <div className="skeleton-bar skeleton-prayer-name" />
          <div className="skeleton-bar skeleton-prayer-time" />
        </div>
      ))}
    </div>
  );
}
