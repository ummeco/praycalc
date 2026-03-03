"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import LocationSearch from "./LocationSearch";

export default function CityPageHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="city-page-header"
    >
      {/* Logo — links home, animates in as if it shrank from the home page position */}
      <motion.div
        initial={{ opacity: 0, scale: 1.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="shrink-0"
      >
        <Link href="/" aria-label="PrayCalc home">
          <Image
            src="/logo.svg"
            alt="PrayCalc"
            width={140}
            height={64}
            priority
            unoptimized
            className="city-page-logo"
          />
        </Link>
      </motion.div>

      {/* Compact search for a new location */}
      <LocationSearch compact />
    </motion.header>
  );
}
