import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { mediaKeys } from "./mediaKeys";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { MediaMovie, MediaTvSeries, MediaTvSeriesSeason } from "@/types/type.db";

export const useMediaMovieQuery = ({
	movieId,
} : {
	movieId?: number | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id: movieId!, type: 'movie' }),
		queryFn: async () => {
			if (!movieId) throw Error('No movieId provided');
			const { data, error } = await supabase
				.from('media_movie')
				.select(`*`)
				.eq('id', movieId)
				.maybeSingle()
				.overrideTypes<MediaMovie>();
			if (error) throw error;
			return data;
		},
		enabled: !!movieId,
	});
};

export const useMediaTvSeriesQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id: tvSeriesId as number, type: 'tv_series' }),
		queryFn: async () => {
			if (!tvSeriesId) throw Error('No tvSeriesId or type provided');
			const { data, error } = await supabase
				.from('media_tv_series')
				.select('*')
				.eq('id', tvSeriesId)
				.maybeSingle()
				.overrideTypes<MediaTvSeries>();
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId,
	});
};

/* --------------------------------- DETAILS -------------------------------- */

export const useMediaMovieDetailsQuery = ({
	id,
	locale,
} : {
	id?: number | null;
	locale: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id: id!, type: 'movie', full: true }),
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
		queryKey: mediaKeys.detail({ id: id as number, type: 'tv_series', full: true }),
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
						name
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

export const useMediaReviewsMovieInfiniteQuery = ({
	movieId,
	filters,
} : {
	movieId: number;
	filters?: {
		perPage?: number;
		sortBy?: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder?: 'asc' | 'desc';
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		sortBy: 'likes_count',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: mediaKeys.reviews({
			id: movieId,
			type: 'movie',
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('user_reviews_movie')
				.select(`
					*,
					activity:user_activities_movie!inner(*, user(*))
				`)
				.eq('activity.movie_id', movieId)
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
		enabled: !!movieId,
	});

};
export const useMediaReviewsTvSeriesInfiniteQuery = ({
	tvSeriesId,
	filters,
} : {
	tvSeriesId: number;
	filters?: {
		perPage?: number;
		sortBy?: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder?: 'asc' | 'desc';
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		sortBy: 'likes_count',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: mediaKeys.reviews({
			id: tvSeriesId,
			type: 'tv_series',
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('user_reviews_tv_series')
				.select(`
					*,
					activity:user_activities_tv_series!inner(*, user(*))
				`)
				.eq('activity.tv_series_id', tvSeriesId)
				.range(from, to)

			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLISTS ------------------------------- */
export const useMediaPlaylistsMovieInfiniteQuery = ({
	movieId,
	filters,
} : {
	movieId: number;
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
			id: movieId,
			type: 'movie',
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('playlists')
				.select('*, user(*), playlist_items_movie!inner(*)')
				.match({
					'type': 'movie',
					'playlist_items_movie.movie_id': movieId,
				})
				.range(from, to);

			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'likes_count':
							request = request.order('likes_count', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
		enabled: !!movieId,
	});
};
export const useMediaPlaylistsTvSeriesInfiniteQuery = ({
	tvSeriesId,
	filters,
} : {
	tvSeriesId: number;
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
			id: tvSeriesId,
			type: 'tv_series',
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('playlists')
				.select('*, user(*), playlist_items_tv_series!inner(*)')
				.match({
					'type': 'tv_series',
					'playlist_items_tv_series.tv_series_id': tvSeriesId,
				})
				.range(from, to);

			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'likes_count':
							request = request.order('likes_count', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- FOLLOWERS ------------------------------- */
export const useMediaMovieFollowersAverageRatingQuery = ({
	movieId,
} : {
	movieId?: number | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.followersAverageRating({ id: movieId!, type: 'movie' }),
		queryFn: async () => {
			if (!movieId) throw Error('No movieId provided');
			const { data, error } = await supabase
				.from('user_activities_movie_follower_average_rating')
				.select('*')
				.match({
					movie_id: movieId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!movieId,
	});
};
export const useMediaTvSeriesFollowersAverageRatingQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.followersAverageRating({ id: tvSeriesId!, type: 'tv_series' }),
		queryFn: async () => {
			if (!tvSeriesId) throw Error('No tvSeriesId provided');
			const { data, error } = await supabase
				.from('user_activities_tv_series_follower_average_rating')
				.select('*')
				.match({
					tv_series_id: tvSeriesId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */