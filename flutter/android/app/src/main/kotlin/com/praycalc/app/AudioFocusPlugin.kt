package com.praycalc.app

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

class AudioFocusPlugin(
    context: Context,
    flutterEngine: FlutterEngine,
) : MethodChannel.MethodCallHandler {

    private val channel = MethodChannel(
        flutterEngine.dartExecutor.binaryMessenger,
        "com.praycalc/audio"
    )

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var focusRequest: AudioFocusRequest? = null

    init {
        channel.setMethodCallHandler(this)
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "requestFocus" -> requestFocus(result)
            "abandonFocus" -> abandonFocus(result)
            else -> result.notImplemented()
        }
    }

    private fun requestFocus(result: MethodChannel.Result) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()

            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(attrs)
                .setAcceptsDelayedFocusGain(false)
                .setOnAudioFocusChangeListener { /* no-op */ }
                .build()

            focusRequest = request
            val outcome = audioManager.requestAudioFocus(request)
            result.success(outcome == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
        } else {
            @Suppress("DEPRECATION")
            val outcome = audioManager.requestAudioFocus(
                { /* no-op */ },
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            )
            result.success(outcome == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
        }
    }

    private fun abandonFocus(result: MethodChannel.Result) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val request = focusRequest
            if (request != null) {
                audioManager.abandonAudioFocusRequest(request)
                focusRequest = null
            }
            result.success(true)
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus { /* no-op */ }
            result.success(true)
        }
    }
}
