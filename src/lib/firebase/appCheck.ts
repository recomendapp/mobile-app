import { FIREBASE_DEBUG_TOKEN_ANDROID, FIREBASE_DEBUG_TOKEN_IOS } from '@/env';
import { getApp } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';

let started = false;

export const startAppCheck = async () => {
	if (started) return;
	started = true;

	const provider = new ReactNativeFirebaseAppCheckProvider();
	provider.configure({
		android: {
			provider: __DEV__ ? 'debug' : 'playIntegrity',
			...((__DEV__ && FIREBASE_DEBUG_TOKEN_ANDROID) && { debugToken: FIREBASE_DEBUG_TOKEN_ANDROID }),
		},
		apple: {
			provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
			...((__DEV__ && FIREBASE_DEBUG_TOKEN_IOS) && { debugToken: FIREBASE_DEBUG_TOKEN_IOS })
		},
	});

	const appCheck = await initializeAppCheck(getApp(), {
		provider,
		isTokenAutoRefreshEnabled: true,
	});

	try {
		const { token } = await appCheck.getToken(true);
		console.log('AppCheck token:', token.slice(0, 16));
	} catch (e) {
		console.warn('AppCheck init error:', e);
	}
}
