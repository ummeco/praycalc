import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PrayCalc — Islamic Prayer Times";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0D2F17 0%, #1E5E2F 60%, #2A7A3E 100%)",
          padding: "60px",
        }}
      >
        {/* Brand name */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: "16px",
            letterSpacing: "-1px",
          }}
        >
          PrayCalc
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "30px",
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 400,
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Islamic Prayer Times
        </div>

        {/* Divider */}
        <div
          style={{
            width: "80px",
            height: "3px",
            background: "#C9F27A",
            borderRadius: "2px",
            marginBottom: "48px",
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255, 255, 255, 0.5)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.5,
          }}
        >
          Accurate prayer times for any location on Earth. GPS-based calculation,
          Qibla direction, Hijri calendar, and moon phases.
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#C9F27A",
            letterSpacing: "1px",
          }}
        >
          praycalc.com
        </div>
      </div>
    ),
    { ...size },
  );
}
