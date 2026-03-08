/**
 * PrayCalcWatch-Bridging-Header.h
 *
 * Exposes the C core prayer calculation library to Swift for offline-first
 * prayer time computation on watchOS. The C core is the primary calculation
 * engine; the PrayCalc API is used only as a fallback when C core fails.
 *
 * Add this file as the Objective-C Bridging Header in Xcode:
 * Build Settings > Swift Compiler - General > Objective-C Bridging Header
 * = PrayCalcWatch/Bridge/PrayCalcWatch-Bridging-Header.h
 *
 * The C source files (nrel_spa.c, pray_calc.c, qibla.c) must be added
 * to the Xcode target's Compile Sources build phase, referenced from
 * ../../core/c/ relative to the watchos/ directory.
 */

#ifndef PrayCalcWatch_Bridging_Header_h
#define PrayCalcWatch_Bridging_Header_h

#include "../../../core/c/nrel_spa.h"
#include "../../../core/c/pray_calc.h"
#include "../../../core/c/qibla.h"

#endif /* PrayCalcWatch_Bridging_Header_h */
