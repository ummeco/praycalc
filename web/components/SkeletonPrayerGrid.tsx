/**
 * Skeleton loader for the prayer times grid.
 * Uses CSS classes from globals.css (PC-1.11).
 */
export default function SkeletonPrayerGrid() {
  const rows = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  return (
    <div className="skeleton-prayer-grid" aria-hidden="true">
      {rows.map((name) => (
        <div key={name} className="skeleton-prayer-row">
          <div className="skeleton-bar skeleton-prayer-name" />
          <div className="skeleton-bar skeleton-prayer-time" />
        </div>
      ))}
    </div>
  );
}
