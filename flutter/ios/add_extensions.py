#!/usr/bin/env python3
"""
add_extensions.py — Adds PrayCalcWidget (WidgetKit) and PrayCalcLiveActivity
(ActivityKit) extension targets to Runner.xcodeproj/project.pbxproj without
needing Xcode.app. Also creates Info.plist and entitlements files for each
extension and adds Runner.entitlements with the shared App Group.

Usage:
    cd praycalc/flutter/ios
    python3 add_extensions.py
"""

import os, shutil, re

IOS_DIR   = os.path.dirname(os.path.abspath(__file__))
PBXPROJ   = os.path.join(IOS_DIR, "Runner.xcodeproj", "project.pbxproj")
BUNDLE_ID = "com.praycalc.praycalcApp"
APP_GROUP = "group.com.praycalc.app"

# ── Deterministic UUID helpers ────────────────────────────────────────────────

def uid(tag):
    """Return a stable 24-char uppercase hex UUID for a given tag string."""
    import hashlib
    h = hashlib.md5(tag.encode()).hexdigest()[:24].upper()
    return h

# Pre-compute all IDs we need
W = {k: uid(f"widget_{k}") for k in [
    "appex", "swift_ref", "plist_ref", "ent_ref",
    "swift_bf",       # build file (Sources)
    "src_phase", "res_phase", "fw_phase",
    "target", "cfg_dbg", "cfg_rel", "cfg_pro", "cfg_list",
    "group", "embed_bf", "proxy", "dep",
]}
L = {k: uid(f"liveact_{k}") for k in [
    "appex", "swift_ref", "plist_ref", "ent_ref",
    "swift_bf",
    "src_phase", "res_phase", "fw_phase",
    "target", "cfg_dbg", "cfg_rel", "cfg_pro", "cfg_list",
    "group", "embed_bf", "proxy", "dep",
]}
R = {k: uid(f"runner_{k}") for k in ["embed_phase", "ent_ref", "ent_bf"]}

# Known IDs from the existing pbxproj
RUNNER_TARGET     = "97C146ED1CF9000F007C117D"
PROJECT_OBJ       = "97C146E61CF9000F007C117D"
PRODUCTS_GROUP    = "97C146EF1CF9000F007C117D"
MAIN_GROUP        = "97C146E51CF9000F007C117D"
RUNNER_CFG_DEBUG  = "97C147061CF9000F007C117D"
RUNNER_CFG_REL    = "97C147071CF9000F007C117D"
RUNNER_CFG_PRO    = "249021D4217E4FDB00AE95B9"

# ── Supporting file content ───────────────────────────────────────────────────

def runner_entitlements():
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>{APP_GROUP}</string>
\t</array>
</dict>
</plist>
"""

def widget_entitlements():
    return runner_entitlements()

def live_activity_entitlements():
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>{APP_GROUP}</string>
\t</array>
</dict>
</plist>
"""

def widget_info_plist():
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>PrayCalcWidget</string>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>XPC!</string>
\t<key>CFBundleShortVersionString</key>
\t<string>$(FLUTTER_BUILD_NAME)</string>
\t<key>CFBundleVersion</key>
\t<string>$(FLUTTER_BUILD_NUMBER)</string>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>com.apple.widgetkit-extension</string>
\t</dict>
</dict>
</plist>
"""

def live_activity_info_plist():
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>PrayCalcLiveActivity</string>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>XPC!</string>
\t<key>CFBundleShortVersionString</key>
\t<string>$(FLUTTER_BUILD_NAME)</string>
\t<key>CFBundleVersion</key>
\t<string>$(FLUTTER_BUILD_NUMBER)</string>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>com.apple.widgetkit-extension</string>
\t</dict>
</dict>
</plist>
"""

# ── pbxproj patch blocks ──────────────────────────────────────────────────────

def build_file_section(w, l, r):
    return f"""\
\t\t{w['swift_bf']} /* PrayCalcWidget.swift in Sources */ = {{isa = PBXBuildFile; fileRef = {w['swift_ref']} /* PrayCalcWidget.swift */; }};
\t\t{w['embed_bf']} /* PrayCalcWidget.appex in Embed Foundation Extensions */ = {{isa = PBXBuildFile; fileRef = {w['appex']} /* PrayCalcWidget.appex */; settings = {{ATTRIBUTES = (RemoveHeadersOnCopy, ); }}; }};
\t\t{l['swift_bf']} /* PrayCalcLiveActivity.swift in Sources */ = {{isa = PBXBuildFile; fileRef = {l['swift_ref']} /* PrayCalcLiveActivity.swift */; }};
\t\t{l['embed_bf']} /* PrayCalcLiveActivity.appex in Embed Foundation Extensions */ = {{isa = PBXBuildFile; fileRef = {l['appex']} /* PrayCalcLiveActivity.appex */; settings = {{ATTRIBUTES = (RemoveHeadersOnCopy, ); }}; }};
"""

def copy_files_section(w, l, r):
    return f"""\
\t\t{r['embed_phase']} /* Embed Foundation Extensions */ = {{
\t\t\tisa = PBXCopyFilesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tdstPath = "";
\t\t\tdstSubfolderSpec = 13;
\t\t\tfiles = (
\t\t\t\t{w['embed_bf']} /* PrayCalcWidget.appex in Embed Foundation Extensions */,
\t\t\t\t{l['embed_bf']} /* PrayCalcLiveActivity.appex in Embed Foundation Extensions */,
\t\t\t);
\t\t\tname = "Embed Foundation Extensions";
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
"""

def file_references_section(w, l, r):
    return f"""\
\t\t{w['appex']} /* PrayCalcWidget.appex */ = {{isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = PrayCalcWidget.appex; sourceTree = BUILT_PRODUCTS_DIR; }};
\t\t{w['swift_ref']} /* PrayCalcWidget.swift */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = PrayCalcWidget.swift; sourceTree = "<group>"; }};
\t\t{w['plist_ref']} /* PrayCalcWidget-Info.plist */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "PrayCalcWidget-Info.plist"; sourceTree = "<group>"; }};
\t\t{w['ent_ref']} /* PrayCalcWidget.entitlements */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = "PrayCalcWidget.entitlements"; sourceTree = "<group>"; }};
\t\t{l['appex']} /* PrayCalcLiveActivity.appex */ = {{isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = PrayCalcLiveActivity.appex; sourceTree = BUILT_PRODUCTS_DIR; }};
\t\t{l['swift_ref']} /* PrayCalcLiveActivity.swift */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = PrayCalcLiveActivity.swift; sourceTree = "<group>"; }};
\t\t{l['plist_ref']} /* PrayCalcLiveActivity-Info.plist */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "PrayCalcLiveActivity-Info.plist"; sourceTree = "<group>"; }};
\t\t{l['ent_ref']} /* PrayCalcLiveActivity.entitlements */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = "PrayCalcLiveActivity.entitlements"; sourceTree = "<group>"; }};
\t\t{r['ent_ref']} /* Runner.entitlements */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = "Runner.entitlements"; sourceTree = "<group>"; }};
"""

def groups_section(w, l):
    return f"""\
\t\t{w['group']} /* PrayCalcWidget */ = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t{w['swift_ref']} /* PrayCalcWidget.swift */,
\t\t\t\t{w['plist_ref']} /* PrayCalcWidget-Info.plist */,
\t\t\t\t{w['ent_ref']} /* PrayCalcWidget.entitlements */,
\t\t\t);
\t\t\tpath = PrayCalcWidget;
\t\t\tsourceTree = "<group>";
\t\t}};
\t\t{l['group']} /* PrayCalcLiveActivity */ = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t{l['swift_ref']} /* PrayCalcLiveActivity.swift */,
\t\t\t\t{l['plist_ref']} /* PrayCalcLiveActivity-Info.plist */,
\t\t\t\t{l['ent_ref']} /* PrayCalcLiveActivity.entitlements */,
\t\t\t);
\t\t\tpath = PrayCalcLiveActivity;
\t\t\tsourceTree = "<group>";
\t\t}};
"""

def native_targets_section(w, l):
    return f"""\
\t\t{w['target']} /* PrayCalcWidget */ = {{
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = {w['cfg_list']} /* Build configuration list for PBXNativeTarget "PrayCalcWidget" */;
\t\t\tbuildPhases = (
\t\t\t\t{w['src_phase']} /* Sources */,
\t\t\t\t{w['fw_phase']} /* Frameworks */,
\t\t\t\t{w['res_phase']} /* Resources */,
\t\t\t);
\t\t\tbuildRules = (
\t\t\t);
\t\t\tdependencies = (
\t\t\t);
\t\t\tname = PrayCalcWidget;
\t\t\tproductName = PrayCalcWidget;
\t\t\tproductReference = {w['appex']} /* PrayCalcWidget.appex */;
\t\t\tproductType = "com.apple.product-type.app-extension";
\t\t}};
\t\t{l['target']} /* PrayCalcLiveActivity */ = {{
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = {l['cfg_list']} /* Build configuration list for PBXNativeTarget "PrayCalcLiveActivity" */;
\t\t\tbuildPhases = (
\t\t\t\t{l['src_phase']} /* Sources */,
\t\t\t\t{l['fw_phase']} /* Frameworks */,
\t\t\t\t{l['res_phase']} /* Resources */,
\t\t\t);
\t\t\tbuildRules = (
\t\t\t);
\t\t\tdependencies = (
\t\t\t);
\t\t\tname = PrayCalcLiveActivity;
\t\t\tproductName = PrayCalcLiveActivity;
\t\t\tproductReference = {l['appex']} /* PrayCalcLiveActivity.appex */;
\t\t\tproductType = "com.apple.product-type.app-extension";
\t\t}};
"""

def container_proxies_section(w, l):
    return f"""\
\t\t{w['proxy']} /* PBXContainerItemProxy */ = {{
\t\t\tisa = PBXContainerItemProxy;
\t\t\tcontainerPortal = {PROJECT_OBJ} /* Project object */;
\t\t\tproxyType = 1;
\t\t\tremoteGlobalIDString = {w['target']};
\t\t\tremoteInfo = PrayCalcWidget;
\t\t}};
\t\t{l['proxy']} /* PBXContainerItemProxy */ = {{
\t\t\tisa = PBXContainerItemProxy;
\t\t\tcontainerPortal = {PROJECT_OBJ} /* Project object */;
\t\t\tproxyType = 1;
\t\t\tremoteGlobalIDString = {l['target']};
\t\t\tremoteInfo = PrayCalcLiveActivity;
\t\t}};
"""

def target_dependencies_section(w, l):
    return f"""\
\t\t{w['dep']} /* PBXTargetDependency */ = {{
\t\t\tisa = PBXTargetDependency;
\t\t\ttarget = {w['target']} /* PrayCalcWidget */;
\t\t\ttargetProxy = {w['proxy']} /* PBXContainerItemProxy */;
\t\t}};
\t\t{l['dep']} /* PBXTargetDependency */ = {{
\t\t\tisa = PBXTargetDependency;
\t\t\ttarget = {l['target']} /* PrayCalcLiveActivity */;
\t\t\ttargetProxy = {l['proxy']} /* PBXContainerItemProxy */;
\t\t}};
"""

def resources_phases_section(w, l):
    return f"""\
\t\t{w['res_phase']} /* Resources */ = {{
\t\t\tisa = PBXResourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
\t\t{l['res_phase']} /* Resources */ = {{
\t\t\tisa = PBXResourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
"""

def frameworks_phases_section(w, l):
    return f"""\
\t\t{w['fw_phase']} /* Frameworks */ = {{
\t\t\tisa = PBXFrameworksBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
\t\t{l['fw_phase']} /* Frameworks */ = {{
\t\t\tisa = PBXFrameworksBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
"""

def sources_phases_section(w, l):
    return f"""\
\t\t{w['src_phase']} /* Sources */ = {{
\t\t\tisa = PBXSourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t\t{w['swift_bf']} /* PrayCalcWidget.swift in Sources */,
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
\t\t{l['src_phase']} /* Sources */ = {{
\t\t\tisa = PBXSourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t\t{l['swift_bf']} /* PrayCalcLiveActivity.swift in Sources */,
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
"""

def build_configs_section(w, l):
    w_common = f"""\
\t\t\t\tCODE_SIGN_ENTITLEMENTS = "PrayCalcWidget/PrayCalcWidget.entitlements";
\t\t\t\tCODE_SIGN_STYLE = Automatic;
\t\t\t\tCURRENT_PROJECT_VERSION = "$(FLUTTER_BUILD_NUMBER)";
\t\t\t\tINFOPLIST_FILE = "PrayCalcWidget/PrayCalcWidget-Info.plist";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = (
\t\t\t\t\t"$(inherited)",
\t\t\t\t\t"@executable_path/Frameworks",
\t\t\t\t\t"@executable_path/../../Frameworks",
\t\t\t\t);
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "{BUNDLE_ID}.PrayCalcWidget";
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSKIP_INSTALL = YES;
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";\
"""
    l_common = f"""\
\t\t\t\tCODE_SIGN_ENTITLEMENTS = "PrayCalcLiveActivity/PrayCalcLiveActivity.entitlements";
\t\t\t\tCODE_SIGN_STYLE = Automatic;
\t\t\t\tCURRENT_PROJECT_VERSION = "$(FLUTTER_BUILD_NUMBER)";
\t\t\t\tINFOPLIST_FILE = "PrayCalcLiveActivity/PrayCalcLiveActivity-Info.plist";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 16.1;
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = (
\t\t\t\t\t"$(inherited)",
\t\t\t\t\t"@executable_path/Frameworks",
\t\t\t\t\t"@executable_path/../../Frameworks",
\t\t\t\t);
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "{BUNDLE_ID}.PrayCalcLiveActivity";
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSKIP_INSTALL = YES;
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";\
"""
    return f"""\
\t\t{w['cfg_dbg']} /* Debug */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{w_common}
\t\t\t}};
\t\t\tname = Debug;
\t\t}};
\t\t{w['cfg_rel']} /* Release */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{w_common}
\t\t\t}};
\t\t\tname = Release;
\t\t}};
\t\t{w['cfg_pro']} /* Profile */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{w_common}
\t\t\t}};
\t\t\tname = Profile;
\t\t}};
\t\t{l['cfg_dbg']} /* Debug */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{l_common}
\t\t\t}};
\t\t\tname = Debug;
\t\t}};
\t\t{l['cfg_rel']} /* Release */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{l_common}
\t\t\t}};
\t\t\tname = Release;
\t\t}};
\t\t{l['cfg_pro']} /* Profile */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{l_common}
\t\t\t}};
\t\t\tname = Profile;
\t\t}};
"""

def config_lists_section(w, l):
    return f"""\
\t\t{w['cfg_list']} /* Build configuration list for PBXNativeTarget "PrayCalcWidget" */ = {{
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t{w['cfg_dbg']} /* Debug */,
\t\t\t\t{w['cfg_rel']} /* Release */,
\t\t\t\t{w['cfg_pro']} /* Profile */,
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t}};
\t\t{l['cfg_list']} /* Build configuration list for PBXNativeTarget "PrayCalcLiveActivity" */ = {{
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t{l['cfg_dbg']} /* Debug */,
\t\t\t\t{l['cfg_rel']} /* Release */,
\t\t\t\t{l['cfg_pro']} /* Profile */,
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t}};
"""

# ── Main patch function ───────────────────────────────────────────────────────

def patch_pbxproj(content):
    """Inject all new sections and update existing ones."""

    # 1. PBXBuildFile section — append before End marker
    content = content.replace(
        "/* End PBXBuildFile section */",
        build_file_section(W, L, R) + "/* End PBXBuildFile section */"
    )

    # 2. PBXCopyFilesBuildPhase section — append the Embed Extensions phase
    content = content.replace(
        "/* End PBXCopyFilesBuildPhase section */",
        copy_files_section(W, L, R) + "/* End PBXCopyFilesBuildPhase section */"
    )

    # 3. PBXFileReference section
    content = content.replace(
        "/* End PBXFileReference section */",
        file_references_section(W, L, R) + "/* End PBXFileReference section */"
    )

    # 4. PBXFrameworksBuildPhase — append new phases
    content = content.replace(
        "/* End PBXFrameworksBuildPhase section */",
        frameworks_phases_section(W, L) + "/* End PBXFrameworksBuildPhase section */"
    )

    # 5. PBXGroup — add extension groups + update Products + Main group
    content = content.replace(
        "/* End PBXGroup section */",
        groups_section(W, L) + "/* End PBXGroup section */"
    )
    # Add appex products to Products group
    content = content.replace(
        "331C8081294A63A400263BE5 /* RunnerTests.xctest */,\n\t\t\t);\n\t\t\tname = Products;",
        f"331C8081294A63A400263BE5 /* RunnerTests.xctest */,\n\t\t\t\t{W['appex']} /* PrayCalcWidget.appex */,\n\t\t\t\t{L['appex']} /* PrayCalcLiveActivity.appex */,\n\t\t\t);\n\t\t\tname = Products;"
    )
    # Add extension groups + Runner.entitlements to main group
    content = content.replace(
        "331C8082294A63A400263BE5 /* RunnerTests */,\n\t\t\t);\n\t\t\tsourceTree = \"<group>\";\n\t\t};",
        f"331C8082294A63A400263BE5 /* RunnerTests */,\n\t\t\t\t{W['group']} /* PrayCalcWidget */,\n\t\t\t\t{L['group']} /* PrayCalcLiveActivity */,\n\t\t\t);\n\t\t\tsourceTree = \"<group>\";\n\t\t}};"
    )
    # Add Runner.entitlements to Runner group
    content = content.replace(
        "74858FAD1ED2DC5600515810 /* Runner-Bridging-Header.h */,\n\t\t\t);\n\t\t\tpath = Runner;",
        f"74858FAD1ED2DC5600515810 /* Runner-Bridging-Header.h */,\n\t\t\t\t{R['ent_ref']} /* Runner.entitlements */,\n\t\t\t);\n\t\t\tpath = Runner;"
    )

    # 6. PBXNativeTarget — add extension targets
    content = content.replace(
        "/* End PBXNativeTarget section */",
        native_targets_section(W, L) + "/* End PBXNativeTarget section */"
    )
    # Add Embed Extensions phase BEFORE Thin Binary to avoid build cycle.
    # The cycle: EmbedExtensions depends on ThinBinary (strips embedded binaries),
    # but ThinBinary also depends on EmbedExtensions (to know what to thin).
    # Fix: place EmbedExtensions before ThinBinary in Runner's buildPhases list.
    content = content.replace(
        "3B06AD1E1E4923F5004D2608 /* Thin Binary */,\n\t\t\t);\n\t\t\tbuildRules = (\n\t\t\t);\n\t\t\tdependencies = (\n\t\t\t);\n\t\t\tname = Runner;",
        f"{R['embed_phase']} /* Embed Foundation Extensions */,\n\t\t\t\t3B06AD1E1E4923F5004D2608 /* Thin Binary */,\n\t\t\t);\n\t\t\tbuildRules = (\n\t\t\t);\n\t\t\tdependencies = (\n\t\t\t\t{W['dep']} /* PBXTargetDependency */,\n\t\t\t\t{L['dep']} /* PBXTargetDependency */,\n\t\t\t);\n\t\t\tname = Runner;"
    )

    # 7. PBXProject — add targets + TargetAttributes
    content = content.replace(
        f"\t\t\t\t97C146ED1CF9000F007C117D /* Runner */,\n\t\t\t\t331C8080294A63A400263BE5 /* RunnerTests */,\n\t\t\t);",
        f"\t\t\t\t97C146ED1CF9000F007C117D /* Runner */,\n\t\t\t\t331C8080294A63A400263BE5 /* RunnerTests */,\n\t\t\t\t{W['target']} /* PrayCalcWidget */,\n\t\t\t\t{L['target']} /* PrayCalcLiveActivity */,\n\t\t\t);"
    )
    # Add TargetAttributes for the new targets
    content = content.replace(
        "97C146ED1CF9000F007C117D = {\n\t\t\t\t\tCreatedOnToolsVersion = 7.3.1;",
        f"{W['target']} = {{\n\t\t\t\t\tCreatedOnToolsVersion = 14.0;\n\t\t\t\t}};\n\t\t\t\t{L['target']} = {{\n\t\t\t\t\tCreatedOnToolsVersion = 14.0;\n\t\t\t\t}};\n\t\t\t\t97C146ED1CF9000F007C117D = {{\n\t\t\t\t\tCreatedOnToolsVersion = 7.3.1;"
    )

    # 8. PBXContainerItemProxy section
    content = content.replace(
        "/* End PBXContainerItemProxy section */",
        container_proxies_section(W, L) + "/* End PBXContainerItemProxy section */"
    )

    # 9. PBXTargetDependency section
    content = content.replace(
        "/* End PBXTargetDependency section */",
        target_dependencies_section(W, L) + "/* End PBXTargetDependency section */"
    )

    # 10. PBXResourcesBuildPhase — append extension phases
    content = content.replace(
        "/* End PBXResourcesBuildPhase section */",
        resources_phases_section(W, L) + "/* End PBXResourcesBuildPhase section */"
    )

    # 11. PBXSourcesBuildPhase — append extension phases
    content = content.replace(
        "/* End PBXSourcesBuildPhase section */",
        sources_phases_section(W, L) + "/* End PBXSourcesBuildPhase section */"
    )

    # 12. XCBuildConfiguration — append extension configs
    # Also update Runner configs to add CODE_SIGN_ENTITLEMENTS
    content = content.replace(
        "/* End XCBuildConfiguration section */",
        build_configs_section(W, L) + "/* End XCBuildConfiguration section */"
    )
    # Add CODE_SIGN_ENTITLEMENTS to Runner debug config
    content = content.replace(
        f"\t\t{RUNNER_CFG_DEBUG} /* Debug */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = 9740EEB21CF90195004384FC",
        f"\t\t{RUNNER_CFG_DEBUG} /* Debug */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = 9740EEB21CF90195004384FC"
    )
    # Insert CODE_SIGN_ENTITLEMENTS into both Runner Debug and Release configs
    for cfg_id in [RUNNER_CFG_DEBUG, RUNNER_CFG_REL, RUNNER_CFG_PRO]:
        # Find the ASSETCATALOG line after each Runner config and add entitlements before it
        content = content.replace(
            f"\t\t{cfg_id} /* ",
            f"\t\t{cfg_id} /* "  # no-op, handled below
        )

    # Simpler: insert entitlements into Runner debug and release build settings
    content = content.replace(
        f"\t\t{RUNNER_CFG_DEBUG} /* Debug */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = 9740EEB21CF90195004384FC /* Debug.xcconfig */;\n\t\t\tbuildSettings = {{\n\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;",
        f"\t\t{RUNNER_CFG_DEBUG} /* Debug */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = 9740EEB21CF90195004384FC /* Debug.xcconfig */;\n\t\t\tbuildSettings = {{\n\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = \"Runner/Runner.entitlements\";"
    )
    content = content.replace(
        f"\t\t{RUNNER_CFG_REL} /* Release */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = 7AFA3C8E1D35360C0083082E /* Release.xcconfig */;\n\t\t\tbuildSettings = {{\n\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCLANG_ENABLE_MODULES = YES;\n\t\t\t\tCURRENT_PROJECT_VERSION = \"$(FLUTTER_BUILD_NUMBER)\";\n\t\t\t\tENABLE_BITCODE = NO;\n\t\t\t\tINFOPLIST_FILE = Runner/Info.plist;",
        f"\t\t{RUNNER_CFG_REL} /* Release */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = 7AFA3C8E1D35360C0083082E /* Release.xcconfig */;\n\t\t\tbuildSettings = {{\n\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCLANG_ENABLE_MODULES = YES;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = \"Runner/Runner.entitlements\";\n\t\t\t\tCURRENT_PROJECT_VERSION = \"$(FLUTTER_BUILD_NUMBER)\";\n\t\t\t\tENABLE_BITCODE = NO;\n\t\t\t\tINFOPLIST_FILE = Runner/Info.plist;"
    )

    # 13. XCConfigurationList — add new lists
    content = content.replace(
        "/* End XCConfigurationList section */",
        config_lists_section(W, L) + "/* End XCConfigurationList section */"
    )

    return content


def main():
    # Back up the original
    backup = PBXPROJ + ".bak"
    shutil.copy2(PBXPROJ, backup)
    print(f"Backup written: {backup}")

    # Read and patch
    with open(PBXPROJ, "r", encoding="utf-8") as f:
        content = f.read()

    # Safety check: don't run twice
    if W['target'] in content:
        print("ERROR: PrayCalcWidget target already present. Aborting (no changes made).")
        return

    patched = patch_pbxproj(content)

    with open(PBXPROJ, "w", encoding="utf-8") as f:
        f.write(patched)
    print("project.pbxproj updated.")

    # Create supporting files

    # Runner.entitlements
    p = os.path.join(IOS_DIR, "Runner", "Runner.entitlements")
    if not os.path.exists(p):
        with open(p, "w") as f: f.write(runner_entitlements())
        print(f"Created: {p}")

    # PrayCalcWidget files
    wd = os.path.join(IOS_DIR, "PrayCalcWidget")
    os.makedirs(wd, exist_ok=True)
    p = os.path.join(wd, "PrayCalcWidget-Info.plist")
    with open(p, "w") as f: f.write(widget_info_plist())
    print(f"Created: {p}")
    p = os.path.join(wd, "PrayCalcWidget.entitlements")
    with open(p, "w") as f: f.write(widget_entitlements())
    print(f"Created: {p}")

    # PrayCalcLiveActivity files
    ld = os.path.join(IOS_DIR, "PrayCalcLiveActivity")
    os.makedirs(ld, exist_ok=True)
    p = os.path.join(ld, "PrayCalcLiveActivity-Info.plist")
    with open(p, "w") as f: f.write(live_activity_info_plist())
    print(f"Created: {p}")
    p = os.path.join(ld, "PrayCalcLiveActivity.entitlements")
    with open(p, "w") as f: f.write(live_activity_entitlements())
    print(f"Created: {p}")

    print("\nDone. Run: flutter build ios --no-codesign --debug")
    print("UIDs used:")
    print(f"  PrayCalcWidget target:       {W['target']}")
    print(f"  PrayCalcLiveActivity target: {L['target']}")


if __name__ == "__main__":
    main()
