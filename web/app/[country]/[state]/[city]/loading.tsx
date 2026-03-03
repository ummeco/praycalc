import SkeletonPrayerGrid from "@/components/SkeletonPrayerGrid";

/**
 * Shown by Next.js App Router during city page navigation.
 * Mirrors the city page layout with skeleton placeholders (PC-1.11).
 */
export default function CityPageLoading() {
  return (
    <main className="city-page-main" aria-label="Loading prayer times">
      {/* City header skeleton */}
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

      {/* Prayer grid skeleton */}
      <SkeletonPrayerGrid />

      {/* Feature tiles skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="skeleton-bar"
            style={{ aspectRatio: "1", borderRadius: "1rem" }}
          />
        ))}
      </div>
    </main>
  );
}
