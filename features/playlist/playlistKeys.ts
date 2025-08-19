import { PlaylistSource, PlaylistType } from "@/types/type.db";

export const playlistKeys = {
	all: ['playlist'] as const,
	details: () => [...playlistKeys.all, 'details'] as const,
	detail: (playlistId: number) => [...playlistKeys.all, playlistId] as const,

	// Items
	items: (playlistId: number) => [...playlistKeys.detail(playlistId), 'items'] as const,
	item: (playlistId: number, itemId: number) => [...playlistKeys.items(playlistId), itemId] as const,
	
	// Guests
	guests: (playlistId: number) => [...playlistKeys.detail(playlistId), 'guests'] as const,
	guestsAdd: ({
		playlistId,
		filters,
	}: {
		playlistId: number;
		filters?: any;
	}) => filters ? [...playlistKeys.guests(playlistId), 'add', filters] : [...playlistKeys.guests(playlistId), 'add'] as const,
	guest: (playlistId: number, guestId: number) => [...playlistKeys.guests(playlistId), guestId] as const,
	
	
	allowedToEdit: ({
		playlistId,
		userId
	} : {
		playlistId: number;
		userId: string;
	}) => [...playlistKeys.detail(playlistId), 'allowedToEdit', userId] as const,

	featured: ({
		filters,
	} : {
		filters?: any;
	}) => filters ? [...playlistKeys.all, 'featured', filters] : [...playlistKeys.all, 'featured'] as const,

	addTo: ({
		id,
		type,
	} : {
		id: number;
		type: PlaylistType;
	}) => [...playlistKeys.all, 'addTo', type, id] as const,
	addToSource: ({
		id,
		type,
		source,
	} : {
		id: number;
		type: PlaylistType;
		source: PlaylistSource;
	}) => [...playlistKeys.addTo({ id, type }), source] as const,
};