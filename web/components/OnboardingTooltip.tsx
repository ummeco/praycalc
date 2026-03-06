"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  /** localStorage key to track whether this tooltip has been shown. */
  storageKey: string;
  /** Delay in ms before showing the tooltip after mount conditions are met. */
  delay?: number;
  /** Auto-dismiss timeout in ms. */
  timeout?: number;
  /** Content text to display. */
  text: string;
  /** Arrow direction: which side of the tooltip the arrow points from. */
  arrow?: "down" | "up";
  /** Only show if this localStorage key is already set (for chaining tooltips). */
  requireKey?: string;
  children: React.ReactNode;
}

export default function OnboardingTooltip({
  storageKey,
  delay = 2000,
  timeout = 8000,
  text,
  arrow = "down",
  requireKey,
  children,
}: Props) {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // private browsing — silent fail
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) return;
      if (requireKey && !localStorage.getItem(requireKey)) return;
    } catch {
      return;
    }

    const showTimer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(showTimer);
  }, [storageKey, requireKey, delay]);

  // Auto-dismiss after timeout
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(dismiss, timeout);
    return () => clearTimeout(t);
  }, [visible, timeout, dismiss]);

  // Outside click
  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        dismiss();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible, dismiss]);

  return (
    <div className="relative inline-flex" ref={tooltipRef}>
      <div onClick={dismiss}>{children}</div>
      {visible && (
        <div
          className={`onboarding-tooltip ${arrow === "down" ? "onboarding-tooltip--above" : "onboarding-tooltip--below"}`}
          role="tooltip"
        >
          <p className="onboarding-tooltip-text">{text}</p>
          <button
            type="button"
            className="onboarding-tooltip-btn"
            onClick={dismiss}
          >
            Got it
          </button>
          <div className={`onboarding-tooltip-arrow onboarding-tooltip-arrow--${arrow}`} />
        </div>
      )}
    </div>
  );
}
