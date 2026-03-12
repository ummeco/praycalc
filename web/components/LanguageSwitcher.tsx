"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";

const LOCALES = [
  { code: "en", dir: "ltr" },
  { code: "ar", dir: "rtl" },
  { code: "tr", dir: "ltr" },
  { code: "ur", dir: "rtl" },
  { code: "id", dir: "ltr" },
  { code: "fr", dir: "ltr" },
  { code: "bn", dir: "ltr" },
  { code: "so", dir: "ltr" },
  { code: "de", dir: "ltr" },
  { code: "es", dir: "ltr" },
  { code: "hi", dir: "ltr" },
  { code: "ms", dir: "ltr" },
  { code: "fa", dir: "rtl" },
  { code: "ps", dir: "rtl" },
  { code: "sw", dir: "ltr" },
  { code: "ha", dir: "ltr" },
  { code: "uz", dir: "ltr" },
  { code: "ku", dir: "rtl" },
  { code: "th", dir: "ltr" },
  { code: "zh", dir: "ltr" },
  { code: "ru", dir: "ltr" },
  { code: "pt", dir: "ltr" },
] as const;

export default function LanguageSwitcher({ variant = "header" }: { variant?: "header" | "footer" | "panel" }) {
  const locale = useLocale();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function switchLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=${60 * 60 * 24 * 365}`;
    setOpen(false);
    window.location.reload();
  }

  const isFooter = variant === "footer";
  const isPanel = variant === "panel";

  return (
    <div ref={ref} className={`lang-switcher${isFooter ? " lang-switcher--footer" : ""}${isPanel ? " lang-switcher--panel" : ""}`}>
      <button
        type="button"
        className="lang-switcher-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Change language"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="lang-switcher-label">{t(locale as any)}</span>
        <svg className={`lang-switcher-chevron ${open ? "lang-switcher-chevron--open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className={`lang-switcher-menu${isFooter ? " lang-switcher-menu--above" : ""}${isPanel ? " lang-switcher-menu--panel" : ""}`} role="listbox">
          {LOCALES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === locale}>
              <button
                type="button"
                className={`lang-switcher-option ${l.code === locale ? "lang-switcher-option--active" : ""}`}
                onClick={() => switchLocale(l.code)}
                dir={l.dir}
              >
                {t(l.code as any)}
                {l.code === locale && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
