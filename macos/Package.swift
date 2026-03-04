// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PrayCalcMenu",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(
            name: "PrayCalcMenu",
            path: "PrayCalcMenu"
        ),
        .testTarget(
            name: "PrayCalcMenuTests",
            dependencies: ["PrayCalcMenu"],
            path: "Tests"
        ),
    ]
)
