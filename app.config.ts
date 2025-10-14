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
	return process.env.EXPO_PUBLIC_WEB_APP;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: getAppName(),
	slug: 'recomend',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './src/assets/images/app/icons/icon.png',
	scheme: 'recomend',
	userInterfaceStyle: 'automatic',
	newArchEnabled: true,
	assetBundlePatterns: [
		'**/*'
	],
	ios: {
		supportsTablet: true,
		bundleIdentifier: getUniqueIdentifier(),
		associatedDomains: [
			`applinks:${getWebDomain()}`
		],
		icon: {
			light: './src/assets/images/app/icons/icon-light.png',
			dark: './src/assets/images/app/icons/icon-dark.png',
			tinted: './src/assets/images/app/icons/icon-tinted.png',
		},
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
			UIDesignRequiresCompatibility: true, // Disable iOS 26 Liquid Glass effect
		},
		usesAppleSignIn: true,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './src/assets/images/app/icons/adaptive-icon.png',
			monochromeImage: './src/assets/images/app/icons/adaptive-icon-monochrome.png',
			backgroundColor: '#0b0909',
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
		favicon: './src/assets/images/app/icons/favicon.png',
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
				android: {
					"compileSdkVersion": 35,
					"targetSdkVersion": 35,
					"buildToolsVersion": "35.0.0"
				},
			},
		],
		[
			'expo-image-picker', {
				photosPermission: 'The app accesses your photos to let you share them with your friends.',
			}
		],
		'expo-secure-store',
		[
			"expo-notifications",
			{
			"sounds":
				[
					"./src/assets/sounds/notif.wav"
				]
			}
	  	],
		[
			"expo-web-browser",
			{
			"experimentalLauncherActivity": true
			}
		],
		[
		  'expo-splash-screen',
		  {
			image: './src/assets/images/app/splash/splash-icon.png',
			imageWidth: 200,
			resizeMode: 'contain',
			backgroundColor: '#0b0909',
			dark: {
				image: './src/assets/images/app/splash/splash-icon-dark.png',
				backgroundColor: '#0b0909',
			},
		  },
		],
		[
			"react-native-share",
			{
				"ios": [
					"fb",
					"fb-messenger",
					"instagram",
					"twitter",
					"tiktoksharesdk",
					"whatsapp",
				],
				"android": [
					"com.facebook.katana",
					"com.facebook.orca",
					"com.instagram.android",
					"com.twitter.android",
					"com.zhiliaoapp.musically",
					"com.whatsapp",
				],
				"enableBase64ShareAndroid": true
			}
		],
		[
			"@react-native-google-signin/google-signin",
			{
				"iosUrlScheme": "com.googleusercontent.apps.413826532912-vt9h8pp36bbk9akq5lshsmf3joqoapmn"
			}
		],
		["expo-apple-authentication"],
		[
			"expo-video",
			{
				"supportsBackgroundPlayback": true,
				"supportsPictureInPicture": true
			}
		],
		[
			"expo-asset",
			{
				"assets": [
				]
			}
		],
		[
			"@sentry/react-native/expo",
			{
				"url": "https://sentry.io/",
				"project": process.env.EXPO_PUBLIC_SENTRY_PROJECT,
				"organization": process.env.EXPO_PUBLIC_SENTRY_ORG,
			}
		]
	],
	experiments: {
		typedRoutes: true,
	},
	extra: {
		webDomain: getWebDomain(),
		router: {
			origin: false,
		},
		eas: {
			projectId: 'cc8f56b7-1052-4648-8e65-43fb7acbf4d8',
		},
	},
	owner: 'lxup',
});