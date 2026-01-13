export const playlistKeys = {
	base: ['playlists'] as const,

	details: ({
		playlistId,
	} : {
		playlistId: number;
	}) => [...playlistKeys.base, playlistId] as const,

	items: ({
		playlistId,
	} : {
		playlistId: number;
	}) => [...playlistKeys.details({ playlistId }), 'items'] as const,

	guests: ({
		playlistId,
	} : {
		playlistId: number;
	}) => [...playlistKeys.details({ playlistId }), 'guests'] as const,
	
	guestsAdd: ({
		playlistId,
		filters,
	}: {
		playlistId: number;
		filters?: {
			search: string;
		};
	}) => filters ? [...playlistKeys.guests({ playlistId }), 'add', filters] : [...playlistKeys.guests({ playlistId }), 'add'] as const,

	allowedToEdit: ({
		playlistId,
		userId
	} : {
		playlistId: number;
		userId: string;
	}) => [...playlistKeys.details({ playlistId }), 'allowedToEdit', userId] as const,

	featured: ({
		filters,
	} : {
		filters?: {
			sortBy: 'created_at' | 'updated_at';
			sortOrder: 'asc' | 'desc';
		};
	}) => filters ? [...playlistKeys.base, 'featured', filters] : [...playlistKeys.base, 'featured'] as const,

	addTo: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...playlistKeys.base, 'addTo', type, id] as const,
	
	addToSource: ({
		id,
		type,
		source,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		source: 'saved' | 'personal';
	}) => [...playlistKeys.addTo({ id, type }), source] as const,
}