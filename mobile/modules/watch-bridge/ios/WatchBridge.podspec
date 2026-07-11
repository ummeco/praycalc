Pod::Spec.new do |s|
  s.name           = 'WatchBridge'
  s.version        = '1.0.0'
  s.summary        = 'PrayCalc phone -> Apple Watch settings bridge (WatchConnectivity).'
  s.description    = 'Native module that pushes location + calc method + madhab to the paired watch via WCSession, matching the contract WatchSessionManager.swift documents on the watch side.'
  s.author         = ''
  s.homepage       = 'https://praycalc.com'
  s.platform       = :ios, '13.0'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
