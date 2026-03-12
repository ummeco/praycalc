// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PrayCalc",
    products: [
        .library(name: "PrayCalc", targets: ["PrayCalc"]),
    ],
    targets: [
        .target(name: "PrayCalc", path: "Sources/PrayCalc"),
        .testTarget(name: "PrayCalcTests", dependencies: ["PrayCalc"], path: "Tests/PrayCalcTests"),
    ]
)
