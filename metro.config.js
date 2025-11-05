const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { getDefaultConfig } = require("expo/metro-config");

const sentryConfig = getSentryExpoConfig(__dirname);
const defaultConfig = getDefaultConfig(__dirname);

sentryConfig.resolver = {
  ...defaultConfig.resolver,
  ...sentryConfig.resolver,
  assetExts: [...(defaultConfig.resolver.assetExts || []), "lottie"],
  sourceExts: [...new Set([...(defaultConfig.resolver.sourceExts || []), "mjs"])],
};

module.exports = sentryConfig;
