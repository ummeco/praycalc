import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrayCalc — Islamic Prayer Times",
    short_name: "PrayCalc",
    description:
      "Accurate Islamic prayer times for any location on Earth. GPS-based, multiple calculation methods, Qibla direction, moon phases, and Hijri calendar.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#1E5E2F",
    background_color: "#0D2F17",
    categories: ["lifestyle", "utilities"],
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
