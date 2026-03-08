package com.praycalc.app

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

class TvLauncherPlugin : FlutterPlugin, MethodChannel.MethodCallHandler {
    private lateinit var channel: MethodChannel
    private lateinit var context: android.content.Context

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        context = binding.applicationContext
        channel = MethodChannel(binding.binaryMessenger, "com.praycalc.app/launcher")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        val pm = context.packageManager
        val aliasComponent = ComponentName(context, "com.praycalc.app.TvLauncherAlias")

        when (call.method) {
            "enableLauncher" -> {
                pm.setComponentEnabledSetting(
                    aliasComponent,
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
                )
                result.success(null)
            }
            "disableLauncher" -> {
                pm.setComponentEnabledSetting(
                    aliasComponent,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                )
                result.success(null)
            }
            "launchStockLauncher" -> {
                val intent = Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_HOME)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                // Exclude our own package so we don't just open ourselves
                val resolveInfos = pm.queryIntentActivities(intent, 0)
                val stockLauncher = resolveInfos.firstOrNull {
                    it.activityInfo.packageName != context.packageName
                }
                if (stockLauncher != null) {
                    val launchIntent = Intent(Intent.ACTION_MAIN).apply {
                        addCategory(Intent.CATEGORY_HOME)
                        setPackage(stockLauncher.activityInfo.packageName)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(launchIntent)
                }
                result.success(null)
            }
            else -> result.notImplemented()
        }
    }
}
