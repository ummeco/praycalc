"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to console in dev; replace with a real error reporting service in prod
    console.error("[PrayCalc] Unhandled error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D2F17",
        padding: "2rem 1rem",
        gap: "1.5rem",
      }}
    >
      {/* Logo */}
      <Link href="/" aria-label="PrayCalc home">
        <Image
          src="/logo.svg"
          alt="PrayCalc"
          width={140}
          height={40}
          priority
        />
      </Link>

      {/* Error message */}
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <p
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "#C9F27A",
            margin: 0,
          }}
        >
          Something went wrong
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(201,242,122,0.6)",
            margin: "0.75rem 0 0",
            lineHeight: 1.5,
          }}
        >
          Prayer times could not be loaded. Please try again — this is usually
          a temporary issue.
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={reset}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#1E5E2F",
            color: "#C9F27A",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9375rem",
          }}
        >
          Try again
        </button>

        <Link
          href="/"
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "0.5rem",
            background: "transparent",
            color: "#79C24C",
            border: "1px solid #1E5E2F",
            fontWeight: 600,
            fontSize: "0.9375rem",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
