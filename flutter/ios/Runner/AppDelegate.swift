import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let controller = window?.rootViewController as! FlutterViewController
    let registrar = controller.registrar(forPlugin: "IAPPlugin")!
    if #available(iOS 15.0, *) {
      IAPPlugin.register(with: registrar)
    }
    let audioRegistrar = controller.registrar(forPlugin: "AudioPlugin")!
    AudioPlugin.register(with: audioRegistrar)

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
  }
}
