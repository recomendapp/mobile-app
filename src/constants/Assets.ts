import { Platform } from 'react-native';

export const Assets = {
	onboarding: {
		tracking: Platform.select({
			ios: 'onboarding_tracking_ios',
			// android: 'onboarding_tracking_android',
			default: 'onboarding_tracking_ios',
		}),
		recos: Platform.select({
			ios: 'onboarding_recos_ios',
			// android: 'onboarding_recos_android',
			default: 'onboarding_recos_ios',
		}),
		playlists: Platform.select({
			ios: 'onboarding_playlists_ios',
			// android: 'onboarding_playlists_android',
			default: 'onboarding_playlists_ios',
		}),
		feed: Platform.select({
			ios: 'onboarding_feed_ios',
			// android: 'onboarding_feed_android',
			default: 'onboarding_feed_ios',
		}),
		socialSharing: Platform.select({
			ios: 'onboarding_social_sharing_ios',
			// android: 'onboarding_social_sharing_android',
			default: 'onboarding_social_sharing_ios',
		}),
	},
}