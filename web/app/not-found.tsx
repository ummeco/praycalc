"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/?q=${encodeURIComponent(q)}`);
  }

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

      {/* 404 heading */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "5rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "#C9F27A",
            margin: 0,
          }}
        >
          404
        </p>
        <p
          style={{
            fontSize: "1.125rem",
            color: "rgba(201,242,122,0.6)",
            margin: "0.5rem 0 0",
          }}
        >
          That page does not exist.
        </p>
      </div>

      {/* Search box */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "0.5rem",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          autoComplete="off"
          style={{
            flex: 1,
            padding: "0.625rem 0.875rem",
            borderRadius: "0.5rem",
            border: "1px solid #1E5E2F",
            background: "#0D2F17",
            color: "#C9F27A",
            fontSize: "0.9375rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.625rem 1rem",
            borderRadius: "0.5rem",
            background: "#1E5E2F",
            color: "#C9F27A",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9375rem",
            whiteSpace: "nowrap",
          }}
        >
          Go
        </button>
      </form>

      {/* Back link */}
      <Link
        href="/"
        style={{
          color: "#79C24C",
          fontSize: "0.875rem",
          textDecoration: "none",
        }}
      >
        &larr; Back to home
      </Link>
    </main>
  );
}
