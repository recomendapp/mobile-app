export const playlistKeys = {
	all: ['playlist'] as const,
	details: () => [...playlistKeys.all, 'details'] as const,
	detail: (playlistId: number) => [...playlistKeys.all, playlistId] as const,
	items: (playlistId: number) => [...playlistKeys.detail(playlistId), 'items'] as const,
	item: (playlistId: number, itemId: number) => [...playlistKeys.items(playlistId), itemId] as const,
	guests: (playlistId: number) => [...playlistKeys.detail(playlistId), 'guests'] as const,
	guestsAdd: ({
		playlistId,
		filters,
	}: {
		playlistId: number;
		filters?: any;
	}) => filters ? [...playlistKeys.guests(playlistId), 'add', filters] : [...playlistKeys.guests(playlistId), 'add'] as const,
	guest: (playlistId: number, guestId: number) => [...playlistKeys.guests(playlistId), guestId] as const,
	
	
	allowedToEdit: (playlistId: number) => [...playlistKeys.detail(playlistId), 'allowedToEdit'] as const,

	featured: ({
		filters,
	} : {
		filters?: any;
	}) => filters ? [...playlistKeys.all, 'featured', filters] : [...playlistKeys.all, 'featured'] as const,
};