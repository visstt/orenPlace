// Metro config to prefer react-native/browser exports.
// Fixes packages like axios that expose different builds via package.json "exports".
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
 
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
 
// Ensure Metro respects conditional exports and prefers react-native/browser over node.
config.resolver = config.resolver || {};
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'default',
];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
 
// Some libs still ship "node" entry as "main". Help Metro pick correct build.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  // Make sure resolution stays within this project.
  app: path.resolve(__dirname, '.'),
};
 
module.exports = config;

