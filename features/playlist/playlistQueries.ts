import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { playlistKeys } from "./playlistKeys";
import { Playlist, PlaylistItemMovie, PlaylistItemTvSeries, PlaylistSource } from "@/types/type.db";

export const usePlaylistQuery = ({
	playlistId,
	initialData
} : {
	playlistId?: number;
	initialData?: Playlist;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.detail(playlistId!),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlists')
				.select(`
					*,
					user(*)
				`)
				.eq('id', playlistId)
				.maybeSingle()
				.overrideTypes<Playlist, { merge: false }>();
			if (error || !data) throw error;
			return data;
		},
		initialData: initialData,
		structuralSharing: false,
		enabled: !!playlistId,
	});
};
// Items
export const usePlaylistItemsMovieQuery = ({
	playlistId,
} : {
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.items(playlistId as number),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_items_movie')
				.select(`*, movie:media_movie(*)`)
				.eq('playlist_id', playlistId)
				.order('rank', { ascending: true })
				.overrideTypes<PlaylistItemMovie[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		structuralSharing: false,
	});
};
export const usePlaylistItemsTvSeriesQuery = ({
	playlistId,
} : {
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.items(playlistId as number),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_items_tv_series')
				.select(`*, tv_series:media_tv_series(*)`)
				.eq('playlist_id', playlistId)
				.order('rank', { ascending: true })
				.overrideTypes<PlaylistItemTvSeries[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		structuralSharing: false,
	});
};

/* --------------------------------- GUESTS --------------------------------- */
export const usePlaylistGuestsQuery = ({
	playlistId
}: {
	playlistId?: number
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.guests(playlistId as number),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_guests')
				.select(`
					*,
					user:user(*)
				`)
				.eq('playlist_id', playlistId)
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		structuralSharing: false,
	});
};

export const usePlaylistIsAllowedToEditQuery = ({
	playlistId,
	userId,
} : {
	playlistId?: number;
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.allowedToEdit({
			playlistId: playlistId!,
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlists')
				.select(`
					user_id,
					user(premium),
					playlist_guests(user_id, edit)
				`)
				.eq('id', playlistId)
				.eq('playlist_guests.user_id', userId)
				.eq('playlist_guests.edit', true)
				.maybeSingle();
			if (error) throw error;
			return Boolean(
				data?.user_id === userId || (data?.playlist_guests.length && data.user.premium)
			)
		},
		enabled: !!playlistId && !!userId,
	});
};

export const usePlaylistGuestsSearchInfiniteQuery = ({
	playlistId,
	filters,
} : {
	playlistId?: number;
	filters?: {
		search?: string;
		perPage?: number;
		exclude?: string[];
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: playlistKeys.guestsAdd({ playlistId: playlistId as number, filters: mergedFilters }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!playlistId) throw Error('Missing playlist id');
			let from = (pageParam - 1) * mergedFilters.perPage;
			let to = from - 1 + mergedFilters.perPage;
			let query = supabase
				.from('user')
				.select('*')
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.search) {
					query = query
						.or(`username.ilike.${mergedFilters.search}%,full_name.ilike.${mergedFilters.search}%`)
				}
				if (mergedFilters.exclude) {
					query = query
						.not('id', 'in', `(${mergedFilters.exclude.join(',')})`)
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		throwOnError: true,
		enabled: !!playlistId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- FEATURED -------------------------------- */
export const usePlaylistFeaturedInfiniteQuery = ({
	filters
} : {
	filters?: {
		sortBy?: 'created_at' | 'updated_at';
		sortOrder?: 'asc' | 'desc';
		resultsPerPage?: number;
	};
} = {}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		sortBy: 'updated_at',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: playlistKeys.featured({ filters: mergedFilters }),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
			let to = from - 1 + mergedFilters.resultsPerPage;
			let query = supabase
				.from('playlists_featured')
				.select('*, playlist:playlists(*, user(*))')
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy) {
					switch (mergedFilters.sortBy) {
						case 'created_at':
							query = query.order('playlist(created_at)', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'updated_at':
							query = query.order('playlist(updated_at)', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
		throwOnError: true,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- ADD TO --------------------------------- */
export const usePlaylistMovieAddToQuery = ({
	movieId,
	userId,
	source = 'personal',
} : {
	movieId: number;
	userId?: string;
	source: PlaylistSource;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.addToSource({ id: movieId, type: 'movie', source }),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!source) throw Error('Missing source');
			if (source === 'personal') { // personal
				const { data, error } = await supabase
					.from('playlists')
					.select('*, playlist_items_movie(count)')
					.match({
						'user_id': userId,
						'playlist_items_movie.movie_id': movieId,
						'type': 'movie'
					})
					.order('updated_at', { ascending: false })
				if (error) throw error;
				const output = data?.map(({ playlist_items_movie, ...playlist }) => ({
					playlist: playlist,
					already_added: playlist_items_movie[0]?.count > 0,
				}));
				return output;
			} else { // shared
				const { data, error } = await supabase
					.from('playlists_saved')
					.select(`
						id,
						playlist:playlists!inner(
							*,
							playlist_guests!inner(*),
							user!inner(*),
							playlist_items_movie(count)
						)
					`)
					.match({
						'user_id': userId,
						'playlist.playlist_guests.user_id': userId,
						'playlist.playlist_guests.edit': true,
						'playlist.user.premium': true,
						'playlist.playlist_items_movie.movie_id': movieId,
						'playlist.type': 'movie'
					})
					.order('updated_at', {
						referencedTable: 'playlist',
						ascending: false 
					})
				if (error) throw error;
				const output = data?.map(({ playlist: { playlist_items_movie, playlist_guests, user, ...playlist }, ...playlists_saved }) => ({
					playlist: playlist,
					already_added: playlist_items_movie[0]?.count > 0,
				}));
				return output;
			}
		},
		enabled: !!userId && !!movieId,
	});
};
export const usePlaylistTvSeriesAddToQuery = ({
	tvSeriesId,
	userId,
	source = 'personal',
} : {
	tvSeriesId: number;
	userId?: string;
	source: PlaylistSource;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.addToSource({ id: tvSeriesId, type: 'tv_series', source }),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!source) throw Error('Missing source');
			if (source === 'personal') { // personal
				const { data, error } = await supabase
					.from('playlists')
					.select('*, playlist_items_tv_series(count)')
					.match({
						'user_id': userId,
						'playlist_items_tv_series.tv_series_id': tvSeriesId,
						'type': 'tv_series'
					})
					.order('updated_at', { ascending: false })
				if (error) throw error;
				const output = data?.map(({ playlist_items_tv_series, ...playlist }) => ({
					playlist: playlist,
					already_added: playlist_items_tv_series[0]?.count > 0,
				}));
				return output;
			} else { // shared
				const { data, error } = await supabase
					.from('playlists_saved')
					.select(`
						id,
						playlist:playlists!inner(
							*,
							playlist_guests!inner(*),
							user!inner(*),
							playlist_items_tv_series(count)
						)
					`)
					.match({
						'user_id': userId,
						'playlist.playlist_guests.user_id': userId,
						'playlist.playlist_guests.edit': true,
						'playlist.user.premium': true,
						'playlist.playlist_items_tv_series.tv_series_id': tvSeriesId,
						'playlist.type': 'tv_series'
					})
					.order('updated_at', {
						referencedTable: 'playlist',
						ascending: false
					})
				if (error) throw error;
				const output = data?.map(({ playlist: { playlist_items_tv_series, playlist_guests, user, ...playlist }, ...playlists_saved }) => ({
					playlist: playlist,
					already_added: playlist_items_tv_series[0]?.count > 0,
				}));
				return output;
			}
		},
		enabled: !!userId && !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

