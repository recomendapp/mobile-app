import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { mediaKeys } from "./mediaKeys";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Media, MediaMovie, MediaTvSeries, MediaTvSeriesSeason } from "@/types/type.db";

/* --------------------------------- DETAILS -------------------------------- */
export const useMediaDetailsQuery = ({
	id,
} : {
	id: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id }),
		queryFn: async () => {
			if (!id) throw Error('No id provided');
			const { data, error } = await supabase
				.from('media')
				.select(`
					*
				`)
				.match({
					media_id: id,
				})
				.maybeSingle()
				.overrideTypes<Media, { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!id,
	});
};

export const useMediaMovieDetailsQuery = ({
	id,
	locale,
} : {
	id?: number | null;
	locale: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id: id as number, type: 'movie' }),
		queryFn: async () => {
			if (!id) throw Error('No id or type provided');
			const { data, error } = await supabase
				.from('media_movie')
				.select(`
					*,
					cast:tmdb_movie_credits(
						id,
						person:media_person(*),
						role:tmdb_movie_roles(*)
					),
					videos:tmdb_movie_videos(*)	
				`)
				.match({
					'id': id,
					'cast.job': 'Actor',
					'videos.iso_639_1': locale.split('-')[0],
					'videos.type': 'Trailer',
				})
				.order('published_at', { referencedTable: 'videos', ascending: true, nullsFirst: false })
				.maybeSingle()
				.overrideTypes<MediaMovie>();
			if (error) throw error;
			return data;
		},
		enabled: !!id && !!locale,
	});
};

export const useMediaTvSeriesDetailsQuery = ({
	id,
	locale,
} : {
	id?: number | null;
	locale: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id: id as number, type: 'tv_series' }),
		queryFn: async () => {
			if (!id) throw Error('No id or type provided');
			const { data, error } = await supabase
				.from('media_tv_series')
				.select(`
					*,
					cast:tmdb_tv_series_credits(
						*,
						person:media_person(*)
					),
					videos:tmdb_tv_series_videos(*),
					seasons:media_tv_series_seasons(*)
				`)
				.match({
					'id': id,
					'cast.job': 'Actor',
					'videos.iso_639_1': locale.split('-')[0],
					'videos.type': 'Trailer',
				})
				.order('published_at', { referencedTable: 'videos', ascending: true, nullsFirst: false })
				.maybeSingle()
				.overrideTypes<MediaTvSeries>();
			if (error) throw error;
			if (!data) return data;
			const specials = data?.seasons?.filter(season => season.season_number === 0) || [];
			const regularSeasons = data?.seasons?.filter(season => season.season_number !== 0) || [];
			const tvSeries: MediaTvSeries = {
				...data!,
				seasons: regularSeasons,
				specials: specials,
			};
			return tvSeries;
		},
		enabled: !!id && !!locale,
	});
};

export const useMediaTvSeriesSeasonDetailsQuery = ({
	id,
	seasonNumber,
} : {
	id?: number | null;
	seasonNumber?: number | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.seasonDetail({ id: id!, seasonNumber: seasonNumber! }),
		queryFn: async () => {
			if (!id || !seasonNumber) throw Error('No id or season number provided');
			const { data, error } = await supabase
				.from('media_tv_series_seasons')
				.select(`
					*,
					episodes:media_tv_series_episodes(
						*
					),
					serie:media_tv_series(
						id,
						title
					)
				`)
				.match({
					serie_id: id,
					season_number: seasonNumber,
				})
				.order('episode_number', { referencedTable: 'episodes', ascending: true })
				.maybeSingle()
				.overrideTypes<MediaTvSeriesSeason, { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!id && !!seasonNumber,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const useMediaReviewsInfiniteQuery = ({
	id,
	filters,
} : {
	id?: number | null;
	filters?: {
		perPage?: number;
		sortBy?: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder?: 'asc' | 'desc';
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		sortBy: 'updated_at',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: mediaKeys.reviews({
			id: id!,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!id) throw Error('No id provided');
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('user_review')
				.select(`
					*,
					activity:user_activity!inner(*, user(*))
				`)
				.eq('activity.media_id', id)
				.range(from, to)

			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'created_at':
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'likes_count':
							request = request.order('likes_count', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!id,
	});

};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLISTS ------------------------------- */
export const useMediaPlaylistsInfiniteQuery = ({
	id,
	filters,
} : {
	id?: number | null;
	filters?: {
		perPage?: number;
		sortBy?: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder?: 'asc' | 'desc';
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		sortBy: 'created_at',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: mediaKeys.playlists({
			id: id!,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!id) throw Error('No id provided');
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('playlists')
				.select('*, user(*), playlist_items!inner(*)')
				.match({
					'playlist_items.media_id': id,
				})
				.range(from, to);
			
			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'created_at':
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'likes_count':
							request = request.order('likes_count', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!id,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- FOLLOWERS ------------------------------- */
export const useMediaFollowersAverageRatingQuery = ({
	id,
} : {
	id?: number | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.followersAverageRating({ id: id! }),
		queryFn: async () => {
			if (!id) throw Error('No id provided');
			const { data, error } = await supabase
				.from('user_followers_average_rating')
				.select('*')
				.match({
					media_id: id,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!id,
	});
};
/* -------------------------------------------------------------------------- */