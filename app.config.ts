import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.recomend.app.dev';
  }

  if (IS_PREVIEW) {
    return 'com.recomend.app.preview';
  }

  return 'com.recomend.app';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Recomend (Dev)';
  }

  if (IS_PREVIEW) {
    return 'Recomend (Preview)';
  }

  return 'Recomend';
};

const getWebDomain = () => {
	return process.env.EXPO_PUBLIC_WEB_APP!;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: getAppName(),
	slug: 'recomend',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/images/icon.png',
	scheme: 'recomend',
	userInterfaceStyle: 'automatic',
	newArchEnabled: true,
	splash: {
		image: './assets/images/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff',
	},
	assetBundlePatterns: [
		'**/*'
	],
	ios: {
		supportsTablet: true,
		bundleIdentifier: getUniqueIdentifier(),
		associatedDomains: [
			`applinks:${getWebDomain()}`
		],
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false
		}
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/images/adaptive-icon.png',
			backgroundColor: '#ffffff',
		},
		edgeToEdgeEnabled: true,
		package: getUniqueIdentifier(),
		intentFilters: [
			{
				action: 'VIEW',
				autoVerify: true,
				data: [
					{
						scheme: 'https',
						host: getWebDomain(),
						pathPrefix: '/',
					},
				],
				category: [
					'BROWSABLE',
					'DEFAULT',
				],
			},
		],
		permissions: [
			'android.permission.RECORD_AUDIO',
		],
		googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './assets/images/favicon.png',
	},
	plugins: [
		'expo-router',
		'expo-localization',
		[
			'expo-build-properties',
			{
				ios: {
					deploymentTarget: '15.1',
				},
			},
		],
		['expo-image-picker', {
			photosPermission: 'The app accesses your photos to let you share them with your friends.',
		}],
		'expo-secure-store',
		'expo-notifications',
	],
	experiments: {
		typedRoutes: true,
	},
	extra: {
		router: {
			origin: false,
		},
		eas: {
			projectId: 'cc8f56b7-1052-4648-8e65-43fb7acbf4d8',
		},
	},
	owner: 'lxup',
});