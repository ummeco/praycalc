import { ImageResponse } from "next/og";
import { geocodeSlug } from "@/lib/geo-server";

export const runtime = "nodejs";
export const alt = "Prayer Times";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Params {
  country: string;
  state: string;
  city: string;
}

export default async function OGImage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { country, state, city } = await params;
  const geo = geocodeSlug(country, state, city);

  const cityName = geo?.displayName
    ?? city
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

  const countryDisplay = country.toUpperCase();

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
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#C9F27A",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.6)",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {countryDisplay}
          </span>
        </div>

        {/* City name */}
        <div
          style={{
            fontSize: cityName.length > 24 ? "56px" : "72px",
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "16px",
            maxWidth: "1000px",
          }}
        >
          {cityName}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 400,
            marginBottom: "48px",
          }}
        >
          Prayer Times
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

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#C9F27A",
              letterSpacing: "1px",
            }}
          >
            PrayCalc
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            praycalc.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
