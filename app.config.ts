import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
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
};

const getGoogleServicesFilePath = () => {
	return process.env.GOOGLE_SERVICES_JSON || './google-services.json';
};

const getGoogleServiceInfoFile = () => {
	return process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist';
};

const getProjectId = () => {
	return 'cc8f56b7-1052-4648-8e65-43fb7acbf4d8';
}

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: getAppName(),
	slug: 'recomend',
	version: '1.0.0',
	runtimeVersion: {
		policy: 'appVersion',
	},
	updates: {
		checkAutomatically: 'ON_LOAD',
		url: `https://u.expo.dev/${getProjectId()}`,
	},
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
		googleServicesFile: getGoogleServiceInfoFile(),
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
			// UIDesignRequiresCompatibility: true, // Disable iOS 26 Liquid Glass effect
			NSLocationWhenInUseUsageDescription: 'Your location is used to show relevant content based on where you are.',
			NSCameraUsageDescription: "The camera is used to upload profile pictures, playlist covers, and story background images.",
			NSPhotoLibraryUsageDescription: "Photos are used to select profile images, playlist covers, and shared story backgrounds.",
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
		googleServicesFile: process.env.GOOGLE_SERVICES_JSON || getGoogleServicesFilePath(),
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
					deploymentTarget: '15.4',
					useFrameworks: 'static',
					forceStaticLinking: [
						'RNFBApp',
						// 'RNFBAppCheck'
					],
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
				photosPermission: 'Select images to upload profile pictures, playlist covers, and story backgrounds.',
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
			"expo-asset",
			{
				"assets": [
					"./src/assets/images/screens/onboarding/"
				]
			}
		],
		[
			"@sentry/react-native/expo",
			{
				"url": "https://sentry.io/",
				"project": process.env.SENTRY_PROJECT,
				"organization": process.env.SENTRY_ORG,
			}
		],
		"@maplibre/maplibre-react-native",
		[
			"expo-media-library",
			{
				"photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
				"savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
				"isAccessMediaLocationEnabled": true,
				"granularPermissions": ["audio", "photo"]
			}
		]
	],
	experiments: {
		typedRoutes: true,
		reactCompiler: true,
	},
	extra: {
		webDomain: getWebDomain(),
		router: {
			origin: false,
		},
		eas: {
			projectId: getProjectId(),
		},
	},
	owner: 'recomend',
});