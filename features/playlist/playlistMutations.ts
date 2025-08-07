import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { userKeys } from "../user/userKeys";
import { matchQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Playlist } from "@/types/type.db";
import { playlistKeys } from "./playlistKeys";
import { mediaKeys } from "../media/mediaKeys";

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
			playlistId,
		} : {
			playlistId: number;
		}) => {
			if (!userId) throw Error('User id is missing');
			const { error } = await supabase
				.from('playlists')
				.delete()
				.eq('id', playlistId)
			if (error) throw error;
			return playlistId;
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
			playlistId,
			payload,
		} : {
			playlistId: number;
			payload: {
				title: string;
				description?: string | null;
				private?: boolean;
				poster_url?: string | null;
			}
		}) => {
			const { data, error } = await supabase
				.from('playlists')
				.update(payload)
				.eq('id', playlistId)
				.select(`*`)
				.single();
			if (error) throw error;
			return data;
		},
	})
};

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