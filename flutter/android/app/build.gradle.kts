import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Load release signing credentials from env vars (CI) or key.properties (local dev).
// Priority: env var > key.properties. Never put credentials in local.properties.
// Local dev: copy android/key.properties.example → android/key.properties and fill in values.
// CI: set SIGNING_STORE_FILE, SIGNING_STORE_PASSWORD, SIGNING_KEY_ALIAS, SIGNING_KEY_PASSWORD.
val keyProps = Properties()
val keyPropsFile = rootProject.file("key.properties")
if (keyPropsFile.exists()) {
    keyPropsFile.inputStream().use { keyProps.load(it) }
}

fun signingProp(envKey: String, fileKey: String): String? =
    System.getenv(envKey) ?: keyProps.getProperty(fileKey)

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
            storeFile = signingProp("SIGNING_STORE_FILE", "storeFile")?.let { file(it) }
            storePassword = signingProp("SIGNING_STORE_PASSWORD", "storePassword")
            keyAlias = signingProp("SIGNING_KEY_ALIAS", "keyAlias")
            keyPassword = signingProp("SIGNING_KEY_PASSWORD", "keyPassword")
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
            applicationId = "app.praycalc"
            resValue("string", "flavor", "google")
        }
        create("amazon") {
            dimension = "distribution"
            applicationId = "app.praycalc.amazon"
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
    // WearOS DataClient — used by WearOsSyncPlugin to push prayer times to paired watch
    implementation("com.google.android.gms:play-services-wearable:18.1.0")
}

flutter {
    source = "../.."
}
