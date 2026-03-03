"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * "Sun rises behind the horizon" logo animation.
 *
 * Structure:
 *   .logo-sunrise-outer  — overflow: visible, holds the glow so it fades
 *                          naturally above the clipping boundary
 *     .logo-sunrise-glow — radial glow, positioned so it can bleed upward
 *     .logo-sunrise      — overflow: hidden; bottom edge IS the horizon
 *       motion.div       — logo rises from y=215 (fully hidden) to y=0
 *
 * The search box in page.tsx sits immediately below .logo-sunrise-outer
 * with mt-[-25px], centering it on the horizon line.
 */
export default function LogoSunrise() {
  return (
    <div className="logo-sunrise-outer">
      {/* Glow outside overflow:hidden so it fades naturally, no hard line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
        className="logo-sunrise-glow"
      />

      <div className="logo-sunrise">
        {/* Logo — rises from fully hidden to resting with bottom clipped */}
        <motion.div
          initial={{ y: 215 }}
          animate={{ y: 0 }}
          transition={{
            duration: 6,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.1,
          }}
          className="absolute top-0 flex justify-center w-full"
        >
          <Image
            src="/logo.svg"
            alt="PrayCalc"
            width={420}
            height={191}
            priority
            unoptimized
            style={{ width: "100%", maxWidth: 420, height: "auto" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
