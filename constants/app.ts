const app = {
	name: 'Recomend',
	webDomain: process.env.EXPO_PUBLIC_WEB_APP!,
	features: {
		playlist_collaborators: 'playlist_collaborators',
		feed_cast_crew: 'feed_cast_crew',
	} as const,

	ratings: {
		countThreshold: 50 // Minimum number of ratings to display the rating from Recomend instead of TMDB
	}
};

export default app;