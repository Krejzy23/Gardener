const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
const { resolver, transformer } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: resolver.sourceExts.includes('svg') ? resolver.sourceExts : [...resolver.sourceExts, 'svg'],
};

module.exports = withNativeWind(config, {
  forceWriteFileSystem: true,
  input: './global.css',
});
