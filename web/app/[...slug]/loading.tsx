import SkeletonPrayerGrid from "@/components/SkeletonPrayerGrid";

/**
 * Shown during slug-based city page navigation (airports, zip codes, non-US cities).
 * PC-1.11 — skeleton loading state.
 */
export default function SlugPageLoading() {
  return (
    <main className="city-page-main" aria-label="Loading prayer times">
      <div className="city-info-header" style={{ marginBottom: "1.5rem" }}>
        <div
          className="skeleton-bar"
          style={{ height: "1.5rem", width: "12rem", marginBottom: "0.5rem" }}
          aria-hidden="true"
        />
        <div
          className="skeleton-bar"
          style={{ height: "1rem", width: "8rem" }}
          aria-hidden="true"
        />
      </div>
      <SkeletonPrayerGrid />
    </main>
  );
}
