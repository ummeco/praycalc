Pod::Spec.new do |s|
  s.name           = 'PrayLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'PrayCalc Live Activity bridge (ActivityKit start/update/end).'
  s.description    = 'Native module that drives the NextPrayer ActivityKit Live Activity from the RN app process.'
  s.author         = ''
  s.homepage       = 'https://praycalc.com'
  s.platform       = :ios, '16.1'
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
