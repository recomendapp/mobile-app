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
	icon: './src/assets/images/icon.png',
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
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
			UIDesignRequiresCompatibility: true, // Disable iOS 26 Liquid Glass effect
		}
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './src/assets/images/adaptive-icon.png',
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
		favicon: './src/assets/images/favicon.png',
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
            ios: {
              enableFullScreenImage_legacy: true,
              backgroundColor: '#ffffff',
              image: './src/assets/splash/splash.png',
              resizeMode: 'cover',
              dark: {
                enableFullScreenImage_legacy: true,
                backgroundColor: '#0b0909',
                image: './src/assets/splash/splash-dark.png',
                resizeMode: 'cover',
              },
            },
            android: {
              backgroundColor: '#0c7cff',
              image: './src/assets/splash/splash-android-icon.png',
              imageWidth: 150,
              dark: {
                backgroundColor: '#0c2a49',
                image: './src/assets/splash/splash-android-icon-dark.png',
                imageWidth: 150,
              },
            },
          },
        ],
		[
			"react-native-share",
			{
				"ios": [
					"fb",
					"instagram",
					"twitter",
					"tiktoksharesdk",
					"whatsapp",
					"messenger",
					"snapchat",
				],
				"android": [
					"com.facebook.katana",
					"com.instagram.android",
					"com.twitter.android",
					"com.zhiliaoapp.musically",
					"com.whatsapp",
					"com.facebook.orca",
					"com.snapchat.android",
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