package com.ummeco.praycalc.tv.system

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Purpose: Classic RN native module bridging PrayCalc TV's Android-TV system integrations
 *   to JS — boot-launch toggle, kiosk (default-launcher) toggle, screensaver settings
 *   deep-link, and ambient-dream text refresh.
 * Inputs: RN bridge calls (see @ReactMethod signatures).
 * Outputs: Promises / SharedPreferences writes / PackageManager component-state changes /
 *   system Intents.
 * Constraints: All component toggles use setComponentEnabledSetting so the boot receiver and
 *   the kiosk activity-alias ship DISABLED in the manifest and are only turned on by explicit
 *   opt-in here. Honest limitation: background activity starts on boot are OS-restricted; on
 *   Android TV / Fire TV leanback apps this generally works, but is not guaranteed on every
 *   TV / OS version.
 * SPORT: praycalc/tv android/system
 */
class TvSystemModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  private fun pm(): PackageManager = reactContext.packageManager

  private fun componentEnabled(className: String): Boolean {
    val component = ComponentName(reactContext, className)
    return when (pm().getComponentEnabledSetting(component)) {
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
      // DEFAULT means "use the manifest value"; both the receiver and the alias ship
      // android:enabled="false", so DEFAULT reads as disabled for our components.
      else -> false
    }
  }

  private fun setComponentEnabled(className: String, enabled: Boolean) {
    val component = ComponentName(reactContext, className)
    val state =
        if (enabled) PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
    pm().setComponentEnabledSetting(component, state, PackageManager.DONT_KILL_APP)
  }

  // --- Boot launch ------------------------------------------------------------

  @ReactMethod
  fun setBootLaunchEnabled(enabled: Boolean) {
    setComponentEnabled(BOOT_RECEIVER, enabled)
  }

  @ReactMethod
  fun isBootLaunchEnabled(promise: Promise) {
    promise.resolve(componentEnabled(BOOT_RECEIVER))
  }

  // --- Kiosk (default launcher) ----------------------------------------------

  @ReactMethod
  fun setKioskEnabled(enabled: Boolean) {
    setComponentEnabled(KIOSK_ALIAS, enabled)
    // Enabling: open the home-chooser so the user can pick PrayCalc as default launcher.
    // Disabling: reopen the chooser so the user can restore the normal TV launcher.
    openHomeChooser()
  }

  @ReactMethod
  fun isKioskEnabled(promise: Promise) {
    promise.resolve(componentEnabled(KIOSK_ALIAS))
  }

  private fun openHomeChooser() {
    // Preferred: the system HOME-settings screen (where the default launcher is chosen).
    val settingsIntent = Intent(Settings.ACTION_HOME_SETTINGS)
    settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val resolved = settingsIntent.resolveActivity(pm())
    if (resolved != null) {
      reactContext.startActivity(settingsIntent)
      return
    }
    // Fallback: fire a HOME chooser so the OS shows the launcher picker.
    val home = Intent(Intent.ACTION_MAIN)
    home.addCategory(Intent.CATEGORY_HOME)
    home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val chooser = Intent.createChooser(home, "Select Home app")
    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    reactContext.startActivity(chooser)
  }

  // --- Screensaver (Daydream / Dream) settings -------------------------------

  @ReactMethod
  fun openScreensaverSettings() {
    // Apps cannot self-select as the system dream; deep-link the user to the picker.
    val intent = Intent("android.settings.DREAM_SETTINGS")
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      reactContext.startActivity(intent)
    } catch (_: Exception) {
      // Some TVs surface dreams only under the general Settings screen; fall back there.
      val fallback = Intent(Settings.ACTION_SETTINGS)
      fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(fallback)
    }
  }

  // --- Ambient dream text feed -----------------------------------------------

  @ReactMethod
  fun setAmbientLines(line1: String?, line2: String?) {
    val prefs =
        reactContext.getSharedPreferences(AMBIENT_PREFS, Context.MODE_PRIVATE)
    prefs.edit()
        .putString(AMBIENT_LINE1, line1 ?: "")
        .putString(AMBIENT_LINE2, line2 ?: "")
        .apply()
  }

  companion object {
    const val NAME = "TvSystemModule"

    // SharedPreferences contract shared with AmbientDreamService.
    const val AMBIENT_PREFS = "praycalc_ambient"
    const val AMBIENT_LINE1 = "line1"
    const val AMBIENT_LINE2 = "line2"

    // Fully-qualified component names toggled via PackageManager.
    private const val BOOT_RECEIVER = "com.ummeco.praycalc.tv.system.BootReceiver"
    private const val KIOSK_ALIAS = "com.ummeco.praycalc.tv.KioskLauncherAlias"
  }
}
