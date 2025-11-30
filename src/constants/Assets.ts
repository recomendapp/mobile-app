import { Platform } from 'react-native';

export const Assets = {
	onboarding: {
		tracking: Platform.select({
			ios: 'onboarding_tracking_ios.png',
			// android: 'onboarding_tracking_android.png',
			default: 'onboarding_tracking_ios.png',
		}),
		recos: Platform.select({
			ios: 'onboarding_recos_ios.png',
			// android: 'onboarding_recos_android.png',
			default: 'onboarding_recos_ios.png',
		}),
		playlists: Platform.select({
			ios: 'onboarding_playlists_ios.png',
			// android: 'onboarding_playlists_android.png',
			default: 'onboarding_playlists_ios.png',
		}),
		feed: Platform.select({
			ios: 'onboarding_feed_ios.png',
			// android: 'onboarding_feed_android.png',
			default: 'onboarding_feed_ios.png',
		}),
		socialSharing: Platform.select({
			ios: 'onboarding_social_sharing_ios.png',
			// android: 'onboarding_social_sharing_android.png',
			default: 'onboarding_social_sharing_ios.png',
		}),
	},
}