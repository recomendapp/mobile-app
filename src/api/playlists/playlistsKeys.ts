export const playlistsKeys = {
	base: ['playlists'] as const,

	details: ({
		playlistId,
	} : {
		playlistId: number;
	}) => [...playlistsKeys.base, playlistId] as const,

	items: ({
		playlistId,
	} : {
		playlistId: number;
	}) => [...playlistsKeys.details({ playlistId }), 'items'] as const,

	guests: ({
		playlistId,
	} : {
		playlistId: number;
	}) => [...playlistsKeys.details({ playlistId }), 'guests'] as const,
	
	guestsAdd: ({
		playlistId,
		filters,
	}: {
		playlistId: number;
		filters?: {
			search: string;
		};
	}) => filters ? [...playlistsKeys.guests({ playlistId }), 'add', filters] : [...playlistsKeys.guests({ playlistId }), 'add'] as const,

	allowedToEdit: ({
		playlistId,
		userId
	} : {
		playlistId: number;
		userId: string;
	}) => [...playlistsKeys.details({ playlistId }), 'allowedToEdit', userId] as const,

	featured: ({
		filters,
	} : {
		filters?: {
			sortBy: 'created_at' | 'updated_at';
			sortOrder: 'asc' | 'desc';
		};
	}) => filters ? [...playlistsKeys.base, 'featured', filters] : [...playlistsKeys.base, 'featured'] as const,

	addTo: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...playlistsKeys.base, 'addTo', type, id] as const,
	
	addToSource: ({
		id,
		type,
		source,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		source: 'saved' | 'personal';
	}) => [...playlistsKeys.addTo({ id, type }), source] as const,
}