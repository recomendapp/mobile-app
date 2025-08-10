import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { userKeys } from "../user/userKeys";
import { matchQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Playlist, PlaylistGuest, PlaylistItem } from "@/types/type.db";
import { playlistKeys } from "./playlistKeys";
import { mediaKeys } from "../media/mediaKeys";

/* -------------------------------- PLAYLIST -------------------------------- */
/**
 * Creates a new playlist
 * @param userId The user id
 * @returns The mutation
 */
export const usePlaylistInsertMutation = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			title,
			description,
			private: isPrivate,
			poster_url,
		} : {
			title: string;
			description?: string;
			private?: boolean;
			poster_url?: string;
		}) => {
			if (!userId) throw Error('User id is missing');
			const { data, error } = await supabase
				.from('playlists')
				.insert({
					title,
					description,
					private: isPrivate,
					poster_url,
					user_id: userId,
				})
				.select(`*`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.playlists({
					userId: data.user_id
				}),
			});
		}
	});
};

/**
 * Deletes a playlist
 * @param userId The user id
 * @returns The mutation
 */
export const usePlaylistDeleteMutation = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
		} : {
			id: number;
		}) => {
			if (!userId) throw Error('User id is missing');
			const { error } = await supabase
				.from('playlists')
				.delete()
				.eq('id', id)
			if (error) throw error;
			return id;
		},
		onSuccess: (playlistId) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.playlists({
					userId: userId as string,
				}),
			});
		}
	});
};

/**
 * Updates a playlist
 * @returns The mutation
 */
export const usePlaylistUpdateMutation = () => {
	const supabase = useSupabaseClient();
	return useMutation({
		mutationFn: async ({
			id,
			...payload
		} : {
			id: number;
			title: string;
			description?: string | null;
			private?: boolean;
			poster_url?: string | null;
		}) => {
			const { data, error } = await supabase
				.from('playlists')
				.update(payload)
				.eq('id', id)
				.select(`*`)
				.single();
			if (error) throw error;
			return data;
		},
	})
};
/* -------------------------------------------------------------------------- */

export const useAddMediaToPlaylists = ({
	mediaId,
	userId,
} : {
	mediaId: number;
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			playlists,
			comment,
		} : {
			playlists: Playlist[];
			comment?: string;
		}) => {
			if (!userId) throw Error('Vous devez être connecté pour effectuer cette action');
			if (!playlists || playlists.length === 0) throw Error('Vous devez sélectionner au moins une playlist');
			const { error } = await supabase
				.from('playlist_items')
				.insert(
					playlists
						.map((playlist) => ({
							playlist_id: playlist?.id!,
							media_id: mediaId,
							user_id: userId,
							comment: comment,
							rank: 0,
						}))
				);
			if (error) throw error;
			const updatedPlaylists = playlists.map((playlist) => ({
				...playlist,
				items_count: (playlist?.items_count ?? 0) + 1,
			}));
			return updatedPlaylists;
		},
		onSuccess: (playlists) => {
			queryClient.invalidateQueries({
				predicate: (query) => playlists.some((playlist) => matchQuery({ queryKey: playlistKeys.items(playlist?.id as number) }, query)) ?? false,
			});
			// Invalidate playlists for the media
			queryClient.invalidateQueries({
				queryKey: mediaKeys.playlists({
					id: mediaId,
				}),
			});
		},
		meta: {
			invalidates: [
				userKeys.addMediaToPlaylist({
					userId: userId!,
					mediaId: mediaId,
				}),
			]
		}
	});
};

/* ---------------------------------- ITEMS --------------------------------- */
export const usePlaylistItemsQueryRealtimeMutation = ({
	playlistId
} : {
	playlistId?: number;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			playlistId,
			event,
			payload,
		} : {
			playlistId: number;
			event: string;
			payload: {
				old: PlaylistItem;
				new: PlaylistItem;
			}
		}) => {
			const newPlaylistItems = [...queryClient.getQueryData<PlaylistItem[]>(playlistKeys.items(playlistId)) || []];
			if (!newPlaylistItems.length) throw new Error('playlist items is undefined');
			switch (event) {
			case 'INSERT':
				if (payload.new.playlist_id !== playlistId) throw new Error('Invalid playlist id');
				newPlaylistItems.forEach(item => {
					if (item.rank >= payload.new.rank) {
						item.rank++;
					}
				});
				newPlaylistItems.push(payload.new);
				break;
			case 'UPDATE':
				if (!payload.new.playlist_id) throw new Error('Invalid playlist id');
				const itemIndex = newPlaylistItems.findIndex((item) => item.id === payload.new.id);
				if (itemIndex === -1) throw new Error('Missing item');

				if (payload.old.rank !== payload.new.rank) {
				if (payload.old.rank < payload.new.rank) {
					newPlaylistItems.forEach(item => {
					if (item.rank > payload.old.rank && item.rank <= payload.new.rank) {
						item.rank--;
					}
					});
				}
				if (payload.old.rank > payload.new.rank) {
					newPlaylistItems.forEach(item => {
					if (item.rank < payload.old.rank && item.rank >= payload.new.rank) {
						item.rank++;
					}
					});
				}
				}
				newPlaylistItems[itemIndex] = payload.new;
				break;
			case 'DELETE':
				if (!payload.old.playlist_id) throw new Error('Invalid playlist id');
				const deleteIndex = newPlaylistItems.findIndex((item) => item.id === payload.old.id);
				if (deleteIndex === -1) throw new Error('Missing item');
				newPlaylistItems.splice(deleteIndex, 1);

				newPlaylistItems.forEach(item => {
					if (item.rank > payload.old.rank) {
						item.rank--;
					}
				});
				break;
			default:
				break;
			};
			newPlaylistItems.sort((a, b) => a.rank - b.rank);
			return {
				id: playlistId,
				items: newPlaylistItems,
			};
		},
		onSuccess: (data) => {
			data && queryClient.setQueryData(playlistKeys.items(data.id), [...data.items]);
		},
		onError: (error) => {
			if (playlistId) {
				queryClient.invalidateQueries({
					queryKey: playlistKeys.items(playlistId),
				});
			}
		}
	});
};

export const usePlaylistItemDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
		} : {
			id: number;
		}) => {
			const { data, error } = await supabase
				.from('playlist_items')
				.delete()
				.eq('id', id)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: playlistKeys.addTo({ mediaId: data.media_id }),
			});
			queryClient.invalidateQueries({
				queryKey: mediaKeys.playlists({
					id: data.media_id,
				}),
			});
			queryClient.setQueryData(playlistKeys.detail(data.playlist_id), (data: Playlist) => {
				if (!data) return null;
				return {
					...data,
					items_count: data.items_count - 1,
				};
			});
		},
	});
};

/* -------------------------------------------------------------------------- */

/* --------------------------------- GUESTS --------------------------------- */

export const usePlaylistGuestsUpsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			playlistId,
			guests,
		} : {
			playlistId: number;
			guests: { user_id: string; edit?: boolean }[];
		}) => {
			const { data, error } = await supabase
				.from('playlist_guests')
				.upsert(
					guests.map(({ user_id, edit }) => ({
						playlist_id: playlistId,
						user_id,
						edit: edit,
					})), {
						onConflict: "playlist_id, user_id",
						defaultToNull: false,
					}
				)
				.select(`
					*,
					user(*)
				`)
			if (error) throw error;
			return { playlistId, data };
		},
		onSuccess: ({ playlistId, data }) => {
			queryClient.setQueryData(playlistKeys.guests(playlistId), (oldData: PlaylistGuest[]) => {
				return [...oldData.filter(g => !data.some(d => d.user_id === g.user_id)), ...data];
			});
		}
	});
};

export const usePlaylistGuestsDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			ids,
			playlistId,
		} : {
			ids: number[];
			playlistId: number;
		}) => {
			const { error } = await supabase
				.from('playlist_guests')
				.delete()
				.in('id', ids)
			if (error) throw error;
			return { ids, playlistId };
		},
		onSuccess: ({ ids, playlistId }) => {
			queryClient.setQueryData(playlistKeys.guests(playlistId), (data: PlaylistGuest[]) => {
				if (!data) return null;
				return data.filter((guest) => !ids.includes(guest?.id));
			});
		}
	});
}


/* -------------------------------------------------------------------------- */