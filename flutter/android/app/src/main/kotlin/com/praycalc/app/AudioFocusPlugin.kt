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

    // Legacy channel kept for backward compat (media_pause_service.dart).
    private val legacyChannel = MethodChannel(
        flutterEngine.dartExecutor.binaryMessenger,
        "com.praycalc/audio"
    )

    // TV audio routing channel (tv_audio_router.dart).
    private val tvChannel = MethodChannel(
        flutterEngine.dartExecutor.binaryMessenger,
        "com.praycalc.tv/audio"
    )

    private val audioManager =
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    // Separate focus requests for each channel so they don't interfere.
    private var legacyFocusRequest: AudioFocusRequest? = null
    private var tvFocusRequest: AudioFocusRequest? = null

    init {
        legacyChannel.setMethodCallHandler(this)
        tvChannel.setMethodCallHandler { call, result -> handleTvCall(call, result) }
    }

    // ── Legacy channel (com.praycalc/audio) ──────────────────────────────────

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "requestFocus" -> requestLegacyFocus(result)
            "abandonFocus" -> abandonLegacyFocus(result)
            else -> result.notImplemented()
        }
    }

    private fun requestLegacyFocus(result: MethodChannel.Result) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()
            val request = AudioFocusRequest.Builder(
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            )
                .setAudioAttributes(attrs)
                .setAcceptsDelayedFocusGain(false)
                .setOnAudioFocusChangeListener {}
                .build()
            legacyFocusRequest = request
            val outcome = audioManager.requestAudioFocus(request)
            result.success(outcome == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
        } else {
            @Suppress("DEPRECATION")
            val outcome = audioManager.requestAudioFocus(
                {},
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            )
            result.success(outcome == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
        }
    }

    private fun abandonLegacyFocus(result: MethodChannel.Result) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            legacyFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
            legacyFocusRequest = null
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus {}
        }
        result.success(true)
    }

    // ── TV audio channel (com.praycalc.tv/audio) ─────────────────────────────

    private fun handleTvCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "requestTransientFocus" -> {
                requestTvFocus(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                result.success(null)
            }
            "duckAudio" -> {
                requestTvFocus(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                result.success(null)
            }
            "releaseFocus" -> {
                releaseTvFocus()
                result.success(null)
            }
            "fadeOut" -> {
                // Flutter-side animation handles the visual fade; we take
                // transient focus so other apps pause.
                requestTvFocus(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                result.success(null)
            }
            "fadeIn" -> {
                releaseTvFocus()
                result.success(null)
            }
            else -> result.notImplemented()
        }
    }

    private fun requestTvFocus(focusType: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
            val request = AudioFocusRequest.Builder(focusType)
                .setAudioAttributes(attrs)
                .setOnAudioFocusChangeListener {}
                .build()
            tvFocusRequest = request
            audioManager.requestAudioFocus(request)
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(
                null,
                AudioManager.STREAM_MUSIC,
                focusType
            )
        }
    }

    private fun releaseTvFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            tvFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
            tvFocusRequest = null
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(null)
        }
    }
}
