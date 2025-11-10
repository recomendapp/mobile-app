import { Platform } from 'react-native';

export const Assets = {
	onboarding: {
		tracking: Platform.select({
			ios: require('@/assets/onboarding/onboarding_tracking_ios.mp4'),
			// android: require('@/assets/onboarding/onboarding_tracking_android.mp4'),
			default: require('@/assets/onboarding/onboarding_tracking_ios.mp4'),
		}),
		recos: Platform.select({
			ios: require('@/assets/onboarding/onboarding_recos_ios.mp4'),
			// android: require('@/assets/onboarding/onboarding_recos_android.mp4'),
			default: require('@/assets/onboarding/onboarding_recos_ios.mp4'),
		}),
		playlists: Platform.select({
			ios: require('@/assets/onboarding/onboarding_playlists_ios.mp4'),
			// android: require('@/assets/onboarding/onboarding_playlists_android.mp4'),
			default: require('@/assets/onboarding/onboarding_playlists_ios.mp4'),
		}),
		social: Platform.select({
			ios: require('@/assets/onboarding/onboarding_social_ios.mp4'),
			// android: require('@/assets/onboarding/onboarding_social_android.mp4'),
			default: require('@/assets/onboarding/onboarding_social_ios.mp4'),
		}),
	},
	screens: {
		auth: {
			login: {
				background: [
					require('@/assets/images/screens/auth/login/background/1.gif'),
				]
			},
			signup: {
				background: [
					require('@/assets/images/screens/auth/signup/background/1.gif'),
				]
			}
		}
	}
}