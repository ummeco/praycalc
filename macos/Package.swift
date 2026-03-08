// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PrayCalcMenu",
    platforms: [.macOS(.v13)],
    targets: [
        // C core library (prayer calculation engine)
        .target(
            name: "PrayCalcCore",
            path: "Sources/PrayCalcCore",
            sources: ["nrel_spa.c", "pray_calc.c", "qibla.c"],
            publicHeadersPath: "."
        ),
        .executableTarget(
            name: "PrayCalcMenu",
            dependencies: ["PrayCalcCore"],
            path: "PrayCalcMenu",
            swiftSettings: [
                .unsafeFlags(["-import-objc-header", "PrayCalcMenu/Bridge/PrayCalcMenu-Bridging-Header.h"])
            ]
        ),
        .testTarget(
            name: "PrayCalcMenuTests",
            dependencies: ["PrayCalcMenu"],
            path: "Tests"
        ),
    ]
)
