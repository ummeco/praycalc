// Purpose: Force Metro to resolve a handful of packages to ONE canonical file path,
//   no matter which package in the tree is doing the requiring.
//
// This works around two DIFFERENT failure modes we've hit in this pnpm monorepo,
// both caused by the same underlying fact: Metro's module registry is keyed by the
// REQUEST PATH it resolved to, not by that path's realpath. Two different symlinks
// that point at the identical on-disk package are still two different modules to
// Metro — each gets its own module id, its own top-level state, and (for anything
// that calls `React.createContext()` at module scope) its own distinct Context
// object that no other copy's Provider/useContext can see.
//
//   1. WRONG VERSION HOISTED TO ROOT. `.npmrc`'s `shamefully-hoist=true` flattens
//      every workspace's transitive deps into the repo-root node_modules, picking
//      ONE version per package name. A package that isn't a direct dependency of
//      `mobile` (e.g. `webidl-conversions`, needed by `expo`'s `whatwg-url-without-
//      unicode`) has ITS OWN transitive requires resolved starting from that root,
//      so if some OTHER workspace (web/org/tv) hoisted an incompatible version of
//      the same package name, `mobile` silently gets that wrong version instead of
//      the one pnpm's lockfile actually pins for it. Symptom: a "[runtime not
//      ready]" crash (ReferenceError/TypeError) the moment the wrong-version code
//      path runs — e.g. `SharedArrayBuffer doesn't exist` from a `webidl-
//      conversions` build that assumes a browser/Node environment.
//
//   2. DUPLICATE INSTANCE OF THE *RIGHT* VERSION. Even when every copy in the
//      store is the SAME version, a package that some dependency vendors as its
//      OWN nested `node_modules/<pkg>` (rather than relying on the hoisted one)
//      still gets bundled as a SEPARATE module from the app's own top-level copy،
//      because Metro never collapses the two symlinks to their shared realpath.
//      This is invisible to a version check (`readlink` on both paths shows they
//      target the same store entry) — the only way to see it is counting how many
//      times the package's entry file actually got registered in the bundle
//      (`grep '"<pkg>/src/index.tsx");'`  — more than one hit means more than one
//      instance. Symptom: a component reading a Context (`useSafeAreaInsets()`,
//      etc.) throws "no value available" even though a correctly-configured
//      Provider undeniably wraps it — the Provider and the consumer are just
//      talking to two different Context objects. We hit this via
//      `@react-navigation/elements@2.9.25`'s own nested copy of
//      `react-native-safe-area-context` shadowing the app's.
//
// Constraints: only add an entry here after actually reproducing the crash/symptom
//   it fixes — don't pre-emptively pin things that aren't broken. `extraNodeModules`
//   is NOT enough for either failure mode — it's only consulted when the normal
//   search fails to find the module at all, and these ARE found (just at the wrong
//   path/version), so the override has to happen in `resolveRequest`, which runs
//   before Metro's default resolution.
const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve a package directory the way Metro does (`resolver.resolverMainFields`,
// default ['react-native', 'browser', 'main']) instead of the way plain Node's
// require.resolve() does (package.json "main"/"exports" only, no custom fields).
// This matters a lot for anything with a `"react-native": "src/index.tsx"` field
// (react-native-safe-area-context, several @react-navigation packages): that field
// points at TypeScript SOURCE specifically so `@react-native/babel-plugin-codegen`'s
// `/\bcodegenNativeComponent</` filename-content check can match it — TS generics
// are erased by the time the compiled `lib/commonjs/*.js` "main" file exists, so
// require.resolve()'s answer never matches and Fabric codegen silently never runs
// for that component's native view config, which surfaces at runtime as "View
// config getter callback for component `X` must be a function (received
// `undefined`)". Pinning a package via require.resolve() alone — as this file
// originally did — reproduces exactly that bug for any pinned package with Fabric
// native components, even though it correctly fixes the *duplicate instance* problem
// that pinning is here for in the first place. Respect the same field order Metro
// does so pinning never changes *which file* a package resolves to, only that every
// origin agrees on that one file.
const MAIN_FIELDS = ['react-native', 'browser', 'main'];
const CANDIDATE_EXTENSIONS = ['', '.tsx', '.ts', '.js', '.jsx'];
function resolvePackageEntry(pkgDir) {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  const mainField = MAIN_FIELDS.map((field) => pkgJson[field]).find((value) => typeof value === 'string') || 'index.js';
  const withExtension = CANDIDATE_EXTENSIONS.map((ext) => path.join(pkgDir, mainField + ext)).find((candidate) =>
    fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
  if (!withExtension) {
    throw new Error(`metro.config.js: couldn't resolve entry file for pinned package at ${pkgDir} (main field: ${mainField})`);
  }
  return withExtension;
}

const PINNED_MODULES = {
  'react-devtools-core': path.resolve(__dirname, 'node_modules/react-devtools-core'),
  'webidl-conversions': path.resolve(__dirname, 'node_modules/webidl-conversions'),
  '@react-navigation/native': path.resolve(__dirname, 'node_modules/@react-navigation/native'),
  '@react-navigation/elements': path.resolve(__dirname, 'node_modules/@react-navigation/elements'),
  '@react-navigation/core': path.resolve(__dirname, 'node_modules/@react-navigation/core'),
  '@react-navigation/routers': path.resolve(__dirname, 'node_modules/@react-navigation/routers'),
  '@sentry/core': path.resolve(__dirname, 'node_modules/@sentry/core'),
  '@sentry/browser': path.resolve(__dirname, 'node_modules/@sentry/browser'),
  // `react` itself: react-devtools-core has no nested `react` dep of its own, so its
  // requires fall through to the workspace-root hoisted copy (19.2.4, for web/org) —
  // a second React instance alongside the app's real one (19.0.0, pinned by
  // react-native) breaks hooks ("Invalid hook call") the moment react-devtools-core's
  // error overlay tries to render.
  react: path.resolve(__dirname, 'node_modules/react'),
  // Failure mode 2 (duplicate instance, see header comment): confirmed THREE
  // separate bundled copies of this module — one nested inside
  // @react-navigation/elements@2.9.25's own node_modules, one via the
  // workspace-root hoist, one via mobile's own node_modules — each with its own
  // SafeAreaInsetsContext. Any screen whose nearest ancestor <SafeAreaProvider>
  // came from a different copy than the one its useSafeAreaInsets() call resolved
  // sees a stale/absent context and throws "No safe area value available", even
  // though the app root is unquestionably wrapped in a real, correctly configured
  // provider.
  'react-native-safe-area-context': path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
  // Same failure mode: resolved via the workspace-root hoist (one dir above `mobile`), so
  // any of its OWN transitive requires that aren't react-native (already fixed above)
  // could still land on a different copy than the app's own. Pinned pre-emptively after
  // RNSScreenContentWrapper (react-native-screens' own DebugContainer -> ScreenContentWrapper
  // -> ScreenContentWrapperNativeComponent chain, used to wrap every screen in dev mode) hit
  // the same "View config getter callback ... must be a function" symptom as
  // RNCSafeAreaProvider did before the react-native pin above.
  'react-native-screens': path.resolve(__dirname, 'node_modules/react-native-screens'),
};

// `react-native` itself is pinned unconditionally (every origin, not an allowlist) for the
// same failure mode #2 as above, just discovered one package at a time: react-native-screens
// and react-native-safe-area-context are resolved via the workspace-root hoist (their real
// path is one directory above `mobile`, e.g. "../node_modules/react-native-screens/..."), so
// Metro's default resolver walks up from THAT origin and finds the root's OWN "react-native"
// symlink — a different module identity than the one `mobile`'s own files and entry chain
// resolve to. react-native owns every Fabric/TurboModule singleton (AppRegistry, the
// ViewConfig registry, NativeModules), so a component whose codegen-generated
// `NativeComponentRegistry.get(name, callback)` call registered `callback` into one copy's
// registry map is invisible to `ReactNativeViewConfigRegistry.get(name)` reading a different
// copy's map — surfacing as "View config getter callback for component `X` must be a
// function (received `undefined`)" for whichever Fabric component happens to be resolved via
// the root hoist. We hit this for RNCSafeAreaProvider, then RNSScreenContentWrapper; there is
// no reason to expect it stops there, hence pinning the package outright instead of continuing
// to allowlist one more origin marker every time a new native component trips over it.
//
// IMPORTANT: this must be built with path.join(), NOT require.resolve(). require.resolve()
// follows the node_modules/react-native symlink to its .pnpm realpath — a DIFFERENT string,
// and so to Metro a DIFFERENT module, from what the app's own entry chain and src/ files land
// on when Metro's default resolver walks up from THEM and stops at this same symlink without
// resolving it further. An earlier version of this fix used require.resolve() applied to
// every origin including the entry chain, and that broke "main" registration outright
// ("main has not been registered") — redirecting the entry chain's own react-native (which
// already correctly resolved to this symlink path) onto the realpath instead was the actual
// regression, not the redirecting-other-origins part. Building the exact symlink-relative
// path by hand and using it everywhere is a no-op for origins that already resolve here
// naturally, and the fix for the ones that don't.
const canonicalReactNative = path.join(__dirname, 'node_modules/react-native/index.js');

const { resolveRequest: defaultResolveRequest } = config.resolver;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native') {
    return { filePath: canonicalReactNative, type: 'sourceFile' };
  }

  const pinned = PINNED_MODULES[moduleName];
  if (pinned) {
    return {
      filePath: resolvePackageEntry(pinned),
      type: 'sourceFile',
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
