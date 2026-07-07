package com.ummeco.praycalc.tv.system

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.ummeco.praycalc.tv.MainActivity

/**
 * Purpose: Launch PrayCalc TV's MainActivity when the TV finishes booting, so the app is
 *   on-screen immediately on power-up. Ships DISABLED in the manifest; only enabled when the
 *   user opts in via TvSystemModule.setBootLaunchEnabled(true).
 * Inputs: ACTION_BOOT_COMPLETED (and QUICKBOOT_POWERON on some OEM TVs).
 * Outputs: starts MainActivity in a new task.
 * Constraints: Pressing Home still returns to the normal Android TV launcher — this only
 *   brings PrayCalc to the foreground once at boot; it does not replace the launcher (that is
 *   kiosk mode's job). Honest limitation: background activity starts at boot are restricted on
 *   some Android versions; on Android TV / Fire TV leanback apps this generally works.
 * SPORT: praycalc/tv android/system
 */
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val action = intent.action
    if (action == Intent.ACTION_BOOT_COMPLETED ||
        action == "android.intent.action.QUICKBOOT_POWERON") {
      val launch = Intent(context, MainActivity::class.java)
      launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      launch.action = Intent.ACTION_MAIN
      launch.addCategory(Intent.CATEGORY_LAUNCHER)
      context.startActivity(launch)
    }
  }
}
