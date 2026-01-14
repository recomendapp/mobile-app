import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { playlistKeys } from "./playlistKeys";
import { SupabaseClient } from "@/lib/supabase/client";
import { ApiClient } from "@recomendapp/api-js";

/* --------------------------------- DETAILS -------------------------------- */
export const playlistDetailsOptions = ({
	supabase,
	playlistId,
} : {
	supabase: SupabaseClient,
	playlistId?: number
}) => {
	return queryOptions({
		queryKey: playlistKeys.details({ playlistId: playlistId! }),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
			.from('playlists')
			.select(`*, user:profile(*)`)
			.eq('id', playlistId)
			.maybeSingle();

			if (error || !data) throw error;
			return data;
		},
		enabled: !!playlistId,
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- ITEMS --------------------------------- */
export const playlistItemsMovieOptions = ({
	supabase,
	playlistId,
} : {
	supabase: SupabaseClient;
	playlistId?: number;
}) => {
	return queryOptions({
		queryKey: playlistKeys.items({
			playlistId: playlistId!,
		}),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_items_movie')
				.select(`*, movie:media_movie(*)`)
				.eq('playlist_id', playlistId)
				.order('rank', { ascending: true })
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
	});
};

export const playlistItemsTvSeriesOptions = ({
	supabase,
	playlistId,
} : {
	supabase: SupabaseClient;
	playlistId?: number;
}) => {
	return queryOptions({
		queryKey: playlistKeys.items({
			playlistId: playlistId!,
		}),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_items_tv_series')
				.select(`*, tv_series:media_tv_series(*)`)
				.eq('playlist_id', playlistId)
				.order('rank', { ascending: true })
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- GUESTS --------------------------------- */
export const playlistGuestsOptions = ({
	supabase,
	playlistId
}: {
	supabase: SupabaseClient;
	playlistId?: number
}) => {
	return queryOptions({
		queryKey: playlistKeys.guests({
			playlistId: playlistId!,
		}),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_guests')
				.select(`
					*,
					user:profile(*)
				`)
				.eq('playlist_id', playlistId)
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
	});
};

export const playlistGuestsAddOptions = ({
	api,
	userId,
	playlistId,
	query,
	guests,
} : {
	api: ApiClient;
	userId?: string;
	playlistId?: number;
	query?: string;
	guests?: { user_id: string; edit: boolean }[];
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: playlistKeys.guestsAdd({
			playlistId: playlistId!,
			filters: {
				search: query!,
			},
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!playlistId) throw Error('Missing playlist id');
			if (!query) throw Error('Missing search query');
			if (!query.length) throw Error('Empty search query');
			if (!userId) throw Error('Missing user id');
			const { data, error } = await api.search.users({
				query: {
					q: query,
					page: pageParam,
					per_page: PER_PAGE,
					exclude_ids: [
						userId,
						...(guests?.map((guest) => guest.user_id) || [])
					].join(','),
				}
			});
			if (error || !data) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.current_page < lastPage.pagination.total_pages
				? lastPage.pagination.current_page + 1
				: undefined;
		},
		enabled: !!playlistId && !!query && !!query.length && !!userId,
	});
};

export const playlistIsAllowedToEditOptions = ({
	supabase,
	playlistId,
	userId,
} : {
	supabase: SupabaseClient;
	playlistId?: number;
	userId?: string;
}) => {
	return queryOptions({
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
/* -------------------------------------------------------------------------- */

/* --------------------------------- ADD TO --------------------------------- */
export const playlistMovieAddToOptions = ({
	supabase,
	movieId,
	userId,
	source,
} : {
	supabase: SupabaseClient;
	movieId: number;
	userId?: string;
	source: 'saved' | 'personal';
}) => {
	return queryOptions({
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

export const playlistTvSeriesAddToOptions = ({
	supabase,
	tvSeriesId,
	userId,
	source,
} : {
	supabase: SupabaseClient;
	tvSeriesId: number;
	userId?: string;
	source: 'saved' | 'personal';
}) => {
	return queryOptions({
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

/* --------------------------------- FEATURED -------------------------------- */
export const playlistsFeaturedOptions = ({
	supabase,
	filters
} : {
	supabase: SupabaseClient;
	filters: {
		sortBy: 'created_at' | 'updated_at';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: playlistKeys.featured({ filters }),
		queryFn: async ({ pageParam = 1 }) => {
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let query = supabase
				.from('playlists_featured')
				.select('*, playlist:playlists(*, user:profile(*))')
				.range(from, to)
			
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'created_at':
						query = query.order('playlist(created_at)', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'updated_at':
					default:
						query = query.order('playlist(updated_at)', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}

			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
	});
};
/* -------------------------------------------------------------------------- */