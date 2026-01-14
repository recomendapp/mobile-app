import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { mediasKeys } from "./mediaKeys";
import { SupabaseClient } from "@/lib/supabase/client";

/* --------------------------------- DETAILS -------------------------------- */
export const mediaMovieDetailsOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.details({ id: movieId!, type: 'movie' }),
		queryFn: async () => {
			if (!movieId) throw new Error('movieId is required');
			const { data, error } = await supabase
				.from('media_movie_full')
				.select('*')
				.eq('id', movieId)
				.maybeSingle()
			if (error) throw error;
			return data;
		},
		enabled: !!movieId,
	});
};

export const mediaTvSeriesDetailsOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.details({ id: tvSeriesId!, type: 'tv_series' }),
		queryFn: async () => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const { data, error } = await supabase
				.from('media_tv_series_full')
				.select('*')
				.eq('id', tvSeriesId)
				.maybeSingle()
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId,
	});
};

export const mediaPersonDetailsOptions = ({
	supabase,
	personId,
} : {
	supabase: SupabaseClient;
	personId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.details({ id: personId!, type: 'person' }),
		queryFn: async () => {
			if (!personId) throw new Error('personId is required');
			const { data, error } = await supabase
				.from('media_person')
				.select('*')
				.eq('id', personId)
				.maybeSingle()
			if (error) throw error;
			return data;
		},
		enabled: !!personId,
	});
};

export const mediaTvSeriesSeasonDetailsOptions = ({
	supabase,
	tvSeriesId,
	seasonNumber,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
	seasonNumber?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.tvSeason({ serieId: tvSeriesId!, seasonNumber: seasonNumber! }),
		queryFn: async () => {
			if (!tvSeriesId || !seasonNumber) throw new Error('tvSeriesId and seasonNumber are required');
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
					serie_id: tvSeriesId,
					season_number: seasonNumber,
				})
				.order('episode_number', { referencedTable: 'episodes', ascending: true })
				.maybeSingle()
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId && !!seasonNumber,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- CREDITS -------------------------------- */
export const mediaMovieCreditsOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.credits({ id: movieId!, type: 'movie' }),
		queryFn: async () => {
			if (!movieId) throw new Error('movieId is required');
			const { data, error } = await supabase
				.from('tmdb_movie_credits')
				.select(`
					*,
					person:media_person(*),
					role:tmdb_movie_roles(*)
				`)
				.eq('movie_id', movieId)
				.neq('department', 'Acting')
			if (error) throw error;
			return data;
		},
		enabled: !!movieId,
	});
};
export const mediaMovieCastOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.cast({
			id: movieId!,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!movieId) throw new Error('movieId is required');
			const { data, error } = await supabase
				.from('media_movie_casting')
				.select(`
					*,
					media_person(*)
				`)
				.eq('movie_id', movieId)
				.order('order', { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!movieId,
	})
};

export const mediaTvSeriesCreditsOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.credits({ id: tvSeriesId!, type: 'tv_series' }),
		queryFn: async () => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const { data, error } = await supabase
				.from('tmdb_tv_series_credits')
				.select(`
					*,
					person:media_person(*)
				`)
				.eq('serie_id', tvSeriesId)
				.neq('department', 'Acting')
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId,
	});
};
export const mediaTvSeriesCastOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.cast({
			id: tvSeriesId!,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const { data, error } = await supabase
				.from('media_tv_series_casting')
				.select(`
					*,
					media_person(*)
				`)
				.eq('serie_id', tvSeriesId)
				.order('order', { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const mediaMovieReviewsOptions = ({
	supabase,
	movieId,
	filters,
} : {
	supabase: SupabaseClient;
	movieId?: number;
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.reviews({ id: movieId!, type: 'movie', filters }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!movieId) throw new Error('movieId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let request = supabase
				.from('user_reviews_movie')
				.select(`
					*,
					activity:user_activities_movie!inner(*, user:profile(*))
				`)
				.eq('activity.movie_id', movieId)
				.range(from, to);
			
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'likes_count':
						request = request.order('likes_count', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'created_at':
						request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'updated_at':
					default:
						request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}

			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!movieId,
	});
};

export const mediaTvSeriesReviewsOptions = ({
	supabase,
	tvSeriesId,
	filters,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.reviews({ id: tvSeriesId!, type: 'tv_series', filters }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let request = supabase
				.from('user_reviews_tv_series')
				.select(`
					*,
					activity:user_activities_tv_series!inner(*, user:profile(*))
				`)
				.eq('activity.tv_series_id', tvSeriesId)
				.range(from, to);
			
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'likes_count':
						request = request.order('likes_count', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'created_at':
						request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'updated_at':
					default:
						request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}

			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLISTS ------------------------------- */
export const mediaMoviePlaylistsOptions = ({
	supabase,
	movieId,
	filters,
} : {
	supabase: SupabaseClient;
	movieId?: number;
	filters: {
		sortBy: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.playlists({ id: movieId!, type: 'movie', filters }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!movieId) throw new Error('movieId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let request = supabase
				.from('playlists')
				.select('*, user:profile(*), playlist_items_movie!inner(*)')
				.match({
					'type': 'movie',
					'playlist_items_movie.movie_id': movieId,
				})
				.range(from, to);

			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'created_at':
						request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'likes_count':
						request = request.order('likes_count', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'updated_at':
					default:
						request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!movieId,
	});
};

export const mediaTvSeriesPlaylistsOptions = ({
	supabase,
	tvSeriesId,
	filters,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
	filters: {
		sortBy: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.playlists({ id: tvSeriesId!, type: 'tv_series', filters }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let request = supabase
				.from('playlists')
				.select('*, user:profile(*), playlist_items_tv_series!inner(*)')
				.match({
					'type': 'tv_series',
					'playlist_items_tv_series.tv_series_id': tvSeriesId,
				})
				.range(from, to);

			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'created_at':
						request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'likes_count':
						request = request.order('likes_count', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'updated_at':
					default:
						request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- TV SERIES ------------------------------- */
export const mediaTvSeriesSeasonsOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.tvSeriesSeasons({ serieId: tvSeriesId! }),
		queryFn: async () => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const { data, error } = await supabase
				.from('media_tv_series_seasons')
				.select('*')
				.eq('serie_id', tvSeriesId)
				.order('season_number', { ascending: true });
			if (error) throw error;
			data.sort((a, b) => {
				if (a.season_number === 0) return 1;
				if (b.season_number === 0) return -1;
				return a.season_number - b.season_number;
			});
			return data;
		},
		enabled: !!tvSeriesId,
	})
}
/* -------------------------------------------------------------------------- */

/* --------------------------------- PERSONS -------------------------------- */
export const mediaPersonFilmsOptions = ({
	supabase,
	personId,
	filters,
} : {
	supabase: SupabaseClient;
	personId: number;
	filters: {
		sortBy: 'release_date' | 'vote_average';
		sortOrder: 'asc' | 'desc';
		department?: string;
		job?: string;
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.personFilms({ personId: personId, filters }),
		queryFn: async ({ pageParam = 1 }) => {
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let request;
			if (filters.department || filters.job) {
				request = supabase
					.from('tmdb_movie_credits')
					.select(`
						*,
						media_movie!inner(*)
					`)
					.eq('person_id', personId)
					.range(from, to);
			} else {
				request = supabase
					.from('media_movie_aggregate_credits')
					.select(`
						*,
						media_movie!inner(*)
					`)
					.eq('person_id', personId)
					.range(from, to);
			}
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'vote_average':
						request = request.order(`media_movie(vote_average)`, { ascending: false });
						break;
					case 'release_date':
					default:
						request = request.order(`media_movie(release_date)`, { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}
			if (filters.department) {
				request = request.eq('department', filters.department);
			}
			if (filters.job) {
				request = request.eq('job', filters.job);
			}

			const { data, error } = await request
				.filter('media_movie.release_date', 'not.is', null);
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!personId,
	});
};

export const mediaPersonTvSeriesOptions = ({
	supabase,
	personId,
	filters,
} : {
	supabase: SupabaseClient;
	personId: number;
	filters: {
		sortBy: 'last_appearance_date' | 'first_air_date' | 'vote_average';
		sortOrder: 'asc' | 'desc';
		department?: string;
		job?: string;
	};
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.personTvSeries({ personId: personId, filters }),
		queryFn: async ({ pageParam = 1 }) => {
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			let request;
			if (filters.department || filters.job) {
				request = supabase
					.from('tmdb_tv_series_credits')
					.select(`
						*,
						media_tv_series!inner(*)
					`)
					.eq('person_id', personId)
					.range(from, to);
			} else {
				request = supabase
					.from('media_tv_series_aggregate_credits')
					.select(`
						*,
						media_tv_series!inner(*)
					`)
					.eq('person_id', personId)
					.range(from, to);
			}
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'first_air_date':
						request = request.order(`media_tv_series(first_air_date)`, { ascending: filters.sortOrder === 'asc' });
						break;
					case 'vote_average':
						request = request.order(`media_tv_series(vote_average)`, { ascending: false });
						break;
					case 'last_appearance_date':
					default:
						if (!filters.department && !filters.job) {
							request = request.order(`last_appearance_date`, { ascending: filters.sortOrder === 'asc' });
						}
						break;
				}
			}
			if (filters.department) {
				request = request.eq('department', filters.department);
			}
			if (filters.job) {
				request = request.eq('job', filters.job);
			}
			if (!filters.department && !filters.job) {
				request = request.filter('last_appearance_date', 'not.is', null);
			}

			const { data, error } = await request
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!personId,
	});
};
/* -------------------------------------------------------------------------- */
		
/* -------------------------------- FOLLOWERS ------------------------------- */
export const mediaMovieFollowersAverageRatingsOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.followersAverageRatings({
			id: movieId,
			type: 'movie',
		}),
		queryFn: async () => {
			const { data, error } = await supabase
				.from('user_activities_movie_follower')
				.select('*, user:profile(*)')
				.eq('movie_id', movieId)
				.not('rating', 'is', null)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data;
		},
		staleTime: 1000 * 60 * 60 // 1 hour
	});
};

export const mediaTvSeriesFollowersAverageRatingsOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.followersAverageRatings({
			id: tvSeriesId,
			type: 'tv_series',
		}),
		queryFn: async () => {
			const { data, error } = await supabase
				.from('user_activities_tv_series_follower')
				.select('*, user:profile(*)')
				.eq('tv_series_id', tvSeriesId)
				.not('rating', 'is', null)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data;
		},
		staleTime: 1000 * 60 * 60 // 1 hour
	});
};

export const mediaMovieFollowersAverageRatingOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.followersAverageRating({ id: movieId!, type: 'movie' }),
		queryFn: async () => {
			if (!movieId) throw Error('No movieId provided');
			const { data, error } = await supabase
				.from('user_activities_movie_follower_average_rating')
				.select('*')
				.eq('movie_id', movieId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!movieId,
	});
};

export const mediaTvSeriesFollowersAverageRatingOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: mediasKeys.followersAverageRating({ id: tvSeriesId!, type: 'tv_series' }),
		queryFn: async () => {
			if (!tvSeriesId) throw Error('No tvSeriesId provided');
			const { data, error } = await supabase
				.from('user_activities_tv_series_follower_average_rating')
				.select('*')
				.eq('tv_series_id', tvSeriesId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- IMAGES --------------------------------- */
export const mediaMoviePostersOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId?: number;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.posters({ id: movieId!, type: 'movie' }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!movieId) throw new Error('movieId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			const { data, error } = await supabase
				.from('media_movie_posters')
				.select('*')
				.eq('movie_id', movieId)
				.range(from, to)
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!movieId,
	});
};

export const mediaTvSeriesPostersOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.posters({ id: tvSeriesId!, type: 'tv_series' }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			const { data, error } = await supabase
				.from('media_tv_series_posters')
				.select('*')
				.eq('serie_id', tvSeriesId)
				.range(from, to)
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!tvSeriesId,
	});
};

export const mediaMovieBackdropsOptions = ({
	supabase,
	movieId,
} : {
	supabase: SupabaseClient;
	movieId?: number;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.backdrops({ id: movieId!, type: 'movie' }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!movieId) throw new Error('movieId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			const { data, error } = await supabase
				.from('media_movie_backdrops')
				.select('*')
				.eq('movie_id', movieId)
				.range(from, to)
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!movieId,
	});
};

export const mediaTvSeriesBackdropsOptions = ({
	supabase,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	tvSeriesId?: number;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: mediasKeys.backdrops({ id: tvSeriesId!, type: 'tv_series' }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!tvSeriesId) throw new Error('tvSeriesId is required');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			const { data, error } = await supabase
				.from('media_tv_series_backdrops')
				.select('*')
				.eq('serie_id', tvSeriesId)
				.range(from, to)
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

export const mediaGenresOptions = ({
	supabase,
} : {
	supabase: SupabaseClient;
}) => {
	return queryOptions({
		queryKey: mediasKeys.genres(),
		queryFn: async () => {
			const { data, error } = await supabase
				.from('media_genre')
				.select('*');
			if (error) throw error;
			return data;
		}
	});
};