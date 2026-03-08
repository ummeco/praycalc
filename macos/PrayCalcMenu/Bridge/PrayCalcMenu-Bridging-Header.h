/**
 * PrayCalcMenu-Bridging-Header.h
 *
 * Exposes the C core prayer calculation library to Swift for macOS.
 * Add this file as the Objective-C Bridging Header in Xcode:
 * Build Settings > Swift Compiler - General > Objective-C Bridging Header
 * = PrayCalcMenu/Bridge/PrayCalcMenu-Bridging-Header.h
 *
 * The C source files (nrel_spa.c, pray_calc.c, qibla.c) must be added
 * to the Xcode target's Compile Sources build phase, referenced from
 * ../../core/c/ relative to the macos/ directory.
 */

#ifndef PrayCalcMenu_Bridging_Header_h
#define PrayCalcMenu_Bridging_Header_h

#include "../../../core/c/nrel_spa.h"
#include "../../../core/c/pray_calc.h"
#include "../../../core/c/qibla.h"

#endif /* PrayCalcMenu_Bridging_Header_h */
