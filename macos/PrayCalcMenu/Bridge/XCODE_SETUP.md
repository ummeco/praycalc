# Xcode Setup for C Core Integration (macOS)

## Option A: Using Swift Package Manager (Package.swift)

The `Package.swift` has been updated to include the C core as a `PrayCalcCore` target.
When building with SPM (`swift build`), the C sources are compiled and linked automatically.

## Option B: Using Xcode Project

If using an Xcode project instead of SPM:

1. **Add C source files to the Xcode project:**
   - Right-click on the PrayCalcMenu group in Xcode
   - Select "Add Files to PrayCalcMenu..."
   - Navigate to `core/c/` (two levels up from `macos/`)
   - Select: `nrel_spa.c`, `nrel_spa.h`, `pray_calc.c`, `pray_calc.h`, `qibla.c`, `qibla.h`
   - Uncheck "Copy items if needed" (reference in place)
   - Check "Add to targets: PrayCalcMenu"

2. **Set the bridging header:**
   - Select the PrayCalcMenu target
   - Go to Build Settings > Swift Compiler - General
   - Set "Objective-C Bridging Header" to:
     `PrayCalcMenu/Bridge/PrayCalcMenu-Bridging-Header.h`

3. **Add Header Search Paths (if needed):**
   - Build Settings > Header Search Paths
   - Add: `$(SRCROOT)/../core/c` (recursive: No)

4. **Build and verify:**
   - Build the project (Cmd+B)
   - The C functions should be available in Swift via `PrayCalcEngine`
