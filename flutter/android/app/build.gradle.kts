import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Load release signing credentials from local.properties (gitignored).
// To configure: copy android/local.properties.example → android/local.properties
// and fill in storeFile, storePassword, keyAlias, keyPassword.
val localProps = Properties()
val localPropsFile = rootProject.file("local.properties")
if (localPropsFile.exists()) {
    localPropsFile.inputStream().use { localProps.load(it) }
}

android {
    namespace = "com.praycalc.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    signingConfigs {
        create("release") {
            storeFile = localProps.getProperty("storeFile")?.let { file(it) }
            storePassword = localProps.getProperty("storePassword")
            keyAlias = localProps.getProperty("keyAlias")
            keyPassword = localProps.getProperty("keyPassword")
        }
    }

    defaultConfig {
        applicationId = "com.praycalc.app"
        minSdk = 24
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // Use release keystore if configured, otherwise fall back to debug.
            signingConfig = if (signingConfigs.getByName("release").storeFile != null) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    // Product flavors: google (Play Store) and amazon (Amazon Appstore / Fire TV)
    flavorDimensions += "distribution"
    productFlavors {
        create("google") {
            dimension = "distribution"
            applicationId = "com.praycalc.app"
            resValue("string", "flavor", "google")
        }
        create("amazon") {
            dimension = "distribution"
            applicationId = "com.praycalc.app.amazon"
            resValue("string", "flavor", "amazon")
            // Fire TV has no Google Play Services — exclude Firebase/GMS at dependency level.
            // FCM is removed via the amazon source-set manifest (tools:node="remove").
        }
    }
}

dependencies {
    implementation("androidx.glance:glance-appwidget:1.1.0")
    implementation("com.android.billingclient:billing:7.0.0")
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
}

flutter {
    source = "../.."
}
