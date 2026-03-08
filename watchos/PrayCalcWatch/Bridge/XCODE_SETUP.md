# Xcode Setup for C Core Integration

## Steps to add C core to the PrayCalcWatch target

1. **Add C source files to the Xcode project:**
   - Right-click on the PrayCalcWatch group in Xcode
   - Select "Add Files to PrayCalcWatch..."
   - Navigate to `core/c/` (two levels up from `watchos/`)
   - Select: `nrel_spa.c`, `nrel_spa.h`, `pray_calc.c`, `pray_calc.h`, `qibla.c`, `qibla.h`
   - Uncheck "Copy items if needed" (reference in place)
   - Check "Add to targets: PrayCalcWatch"

2. **Set the bridging header:**
   - Select the PrayCalcWatch target
   - Go to Build Settings > Swift Compiler - General
   - Set "Objective-C Bridging Header" to:
     `PrayCalcWatch/Bridge/PrayCalcWatch-Bridging-Header.h`

3. **Add Header Search Paths (if needed):**
   - Build Settings > Header Search Paths
   - Add: `$(SRCROOT)/../core/c` (recursive: No)

4. **Build and verify:**
   - Build the project (Cmd+B)
   - The C functions should be available in Swift via `PrayCalcEngine`
