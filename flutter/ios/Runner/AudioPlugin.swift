import Flutter
import AVFoundation

class AudioPlugin: NSObject, FlutterPlugin {
    static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(
            name: "com.praycalc/audio",
            binaryMessenger: registrar.messenger()
        )
        let instance = AudioPlugin()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }

    func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "requestFocus":
            requestFocus(result: result)
        case "abandonFocus":
            abandonFocus(result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }

    private func requestFocus(result: @escaping FlutterResult) {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(
                .playback,
                mode: .default,
                options: [.duckOthers]
            )
            try session.setActive(true)
            result(true)
        } catch {
            result(FlutterError(
                code: "AUDIO_FOCUS_FAILED",
                message: error.localizedDescription,
                details: nil
            ))
        }
    }

    private func abandonFocus(result: @escaping FlutterResult) {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setActive(
                false,
                options: .notifyOthersOnDeactivation
            )
            result(true)
        } catch {
            result(FlutterError(
                code: "AUDIO_ABANDON_FAILED",
                message: error.localizedDescription,
                details: nil
            ))
        }
    }
}
