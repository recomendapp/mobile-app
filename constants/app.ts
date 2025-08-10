const app = {
	name: 'Recomend',
	webDomain: process.env.EXPO_PUBLIC_WEB_APP!,
	features: {
		playlist_collaborators: 'playlist_collaborators' 
	} as const,
};

export default app;