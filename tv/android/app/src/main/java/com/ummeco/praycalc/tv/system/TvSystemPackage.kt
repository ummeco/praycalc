package com.ummeco.praycalc.tv.system

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Purpose: RN ReactPackage that registers TvSystemModule so JS can reach the Android-TV
 *   system integrations (boot launch / kiosk / screensaver / ambient lines).
 * Inputs: ReactApplicationContext (from MainApplication's package list).
 * Outputs: the TvSystemModule instance; no view managers.
 * Constraints: classic (non-TurboModule) package; added manually in MainApplication.
 * SPORT: praycalc/tv android/system
 */
class TvSystemPackage : ReactPackage {
  override fun createNativeModules(
      reactContext: ReactApplicationContext
  ): List<NativeModule> = listOf(TvSystemModule(reactContext))

  override fun createViewManagers(
      reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> = emptyList()
}
