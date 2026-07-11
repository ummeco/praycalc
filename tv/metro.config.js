/**
 * Metro configuration for PrayCalc TV (bare react-native-tvos).
 *
 * Required by createBundleReleaseJsAndAssets. Two monorepo traps handled here:
 * 1. pnpm symlinks: node_modules entries point into the workspace root's .pnpm
 *    store, outside the default project scope — watchFolders/nodeModulesPaths
 *    widen resolution to the workspace root.
 * 2. Mixed React Native versions: the workspace root hoists mobile's react-native
 *    0.79 (+ React 19), while tv/ must bundle react-native-tvos 0.74 (+ its own
 *    React). extraNodeModules pins the critical packages to tv/'s local copies and
 *    blockList hides the root copies from the resolver so hierarchical lookup can
 *    never escape to the wrong fork.
 */
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');
const esc = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pinned = ['react-native', 'react', 'react-dom', '@babel/runtime'];

/** @type {import('metro-config').MetroConfig} */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    extraNodeModules: Object.fromEntries(
      pinned.map((name) => [name, path.resolve(projectRoot, 'node_modules', name)]),
    ),
    // Block the ROOT copies at their .pnpm REALPATHS (metro resolves through the
    // symlinks) — `react-native@...` matches only mobile's upstream RN package;
    // tv's fork lives under `react-native-tvos@...` and stays visible.
    blockList: exclusionList([
      /node_modules\/\.pnpm\/react-native@[^/]+\/node_modules\/react-native\/.*/,
      new RegExp(`${esc(workspaceRoot)}/node_modules/react-native/.*`),
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
