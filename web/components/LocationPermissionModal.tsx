"use client";

interface Props {
  /** "prompt" = hasn't been asked yet; "denied" = user previously denied */
  state: "prompt" | "denied";
  onAllow: () => void;
  onDismiss: () => void;
}

/**
 * Pre-permission modal shown before triggering the browser geolocation prompt.
 * Explains why location access matters so the user is informed before the
 * browser's native (context-free) dialog appears.
 */
export default function LocationPermissionModal({ state, onAllow, onDismiss }: Props) {
  return (
    <div
      className="location-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      onClick={onDismiss}
    >
      <div
        className="location-modal-card motion-safe:animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="location-modal-icon-wrap" aria-hidden="true">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2"
            />
          </svg>
        </div>

        <h2 id="location-modal-title" className="location-modal-title">
          {state === "denied" ? "Location Access Blocked" : "Allow Location Access"}
        </h2>

        {state === "denied" ? (
          <p className="location-modal-body">
            Location access was blocked. To use prayer times for your location, open
            your browser settings, find <strong>Site settings → Location</strong>, and
            allow access for praycalc.com.
          </p>
        ) : (
          <>
            <p className="location-modal-body">
              Your location is used to calculate accurate prayer times, point Qibla
              direction, and automatically update times when you travel.
            </p>
            <p className="location-modal-body location-modal-body--secondary">
              PrayCalc never stores or shares your location — it is calculated locally
              and discarded immediately.
            </p>
          </>
        )}

        {state === "prompt" ? (
          <button
            type="button"
            onClick={onAllow}
            className="location-modal-allow-btn"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2" />
            </svg>
            Allow Location Access
          </button>
        ) : (
          <button
            type="button"
            onClick={onDismiss}
            className="location-modal-allow-btn"
          >
            Got it
          </button>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="location-modal-dismiss-btn"
        >
          {state === "denied" ? "Search manually instead" : "Not now"}
        </button>
      </div>
    </div>
  );
}
