import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { userKeys } from "./userKeys"
import { Playlist, UserActivity, UserFollower, UserFriend, UserRecosAggregated, UserWatchlist, Profile, UserWatchlistTvSeries, UserWatchlistMovie, UserReviewMovie, UserReviewTvSeries, UserRecosMovieAggregated, UserRecosTvSeriesAggregated, UserActivityMovie, UserActivityTvSeries } from "@recomendapp/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

/* ---------------------------------- USER ---------------------------------- */

export const useUserProfileQuery = ({
	username,
} : {
	username?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.profile(username as string),
		queryFn: async () => {
			if (!username) return null;
			const { data, error } = await supabase
				.from('profile')
				.select('*')
				.eq('username', username)
				.maybeSingle()
				.overrideTypes<Profile, { merge: true }>();
			if (error) throw error;
			return data;
		},
		enabled: !!username,
	});
};

/**
 * Fetches the user friends
 * @param userId The user id
 * @param filters The filters
 * @returns The user friends
 */
export const useUserFriendsQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		search?: string | null;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.friends(userId as string, filters),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let query = supabase
				.from('user_friend')
				.select('id, friend:friend_id!inner(*)')
				.eq('user_id', userId)
			if (filters) {
				if (filters.search) {
					query = query
						.ilike(`friend.username`, `${filters.search}%`)
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- ACTIVITY -------------------------------- */
export const useUserActivitiesInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string
	filters?: {
		sortBy?: 'watched_date' | 'rating';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		sortBy: 'watched_date',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.activities({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('user_activities')
				.select(`*`)
				.eq('user_id', userId)
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters?.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'watched_date':
							request = request.order('watched_date', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'rating':
							request = request
								.not('rating', 'is', null)
								.order('rating', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await request
				.overrideTypes<UserActivity[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
export const useUserActivitiesMovieInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string
	filters?: {
		sortBy?: 'watched_date' | 'rating';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		sortBy: 'watched_date',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.activities({
			userId: userId as string,
			filters: mergedFilters,
			type: 'movie',
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('user_activities_movie')
				.select(`*, movie:media_movie(*)`)
				.eq('user_id', userId)
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters?.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'watched_date':
							request = request.order('watched_date', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'rating':
							request = request
								.not('rating', 'is', null)
								.order('rating', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await request
				.overrideTypes<UserActivityMovie[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
export const useUserActivitiesTvSeriesInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string
	filters?: {
		sortBy?: 'watched_date' | 'rating';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		sortBy: 'watched_date',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.activities({
			userId: userId as string,
			filters: mergedFilters,
			type: 'tv_series',
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('user_activities_tv_series')
				.select(`*, tv_series:media_tv_series(*)`)
				.eq('user_id', userId)
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters?.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'watched_date':
							request = request.order('watched_date', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'rating':
							request = request
								.not('rating', 'is', null)
								.order('rating', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await request
				.overrideTypes<UserActivityTvSeries[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

// Movies
export const useUserActivityMovieQuery = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.activity({
			id: movieId!,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activities_movie')
				.select('*, review:user_reviews_movie(*)')
				.match({
					'user_id': userId,
					'movie_id': movieId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!movieId,
	});
};
// TV Series
export const useUserActivityTvSeriesQuery = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.activity({
			id: tvSeriesId!,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activities_tv_series')
				.select('*, review:user_reviews_tv_series(*)')
				.match({
					'user_id': userId,
					'tv_series_id': tvSeriesId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!tvSeriesId,
	});
};

export const useUserActivityMovieFollowersRatingQuery = ({
	movieId,
	userId,
} : {
	movieId: number;
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.followersRating({
			id: movieId,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activities_movie_follower')
				.select('*, user:profile(*)')
				.eq('movie_id', movieId)
				.not('rating', 'is', null)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!movieId,
	});
};
export const useUserActivityTvSeriesFollowersRatingQuery = ({
	tvSeriesId,
	userId,
} : {
	tvSeriesId: number;
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.followersRating({
			id: tvSeriesId,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activities_tv_series_follower')
				.select('*, user:profile(*)')
				.eq('tv_series_id', tvSeriesId)
				.not('rating', 'is', null)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
// Movies
export const useUserReviewMovieQuery = ({
	reviewId,
	initialData,
} : {
	reviewId: number;
	initialData?: UserReviewMovie;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.review({
			id: reviewId,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_reviews_movie')
				.select('*, activity:user_activities_movie(*, movie:media_movie(*), user:profile(*))')
				.eq('id', reviewId)
				.maybeSingle()
				.overrideTypes<UserReviewMovie, { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialData: initialData,
		enabled: !!reviewId,
	});
};

// TV Series
export const useUserReviewTvSeriesQuery = ({
	reviewId,
	initialData,
} : {
	reviewId: number;
	initialData?: UserReviewTvSeries;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.review({
			id: reviewId,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_reviews_tv_series')
				.select('*, activity:user_activities_tv_series(*, tv_series:media_tv_series(*), user:profile(*))')
				.eq('id', reviewId)
				.maybeSingle()
				.overrideTypes<UserReviewTvSeries, { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialData: initialData,
		enabled: !!reviewId,
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
export const useUserRecosQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'created_at' | 'random';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recos({
			userId: userId!,
			type: 'all',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from(filters?.sortBy === 'random' ? 'user_recos_aggregated_random' : 'user_recos_aggregated')
				.select('*')
				.match({
					'user_id': userId,
					'status': 'active',
				})
			
			if (filters) {
				if (filters.sortBy !== 'random') {
					switch (filters.sortBy) {
						default:
							request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
							break;
					}
				}
				if (filters.limit) {
					request = request.limit(filters.limit);
				}
			}
			const { data, error } = await request
				.overrideTypes<UserRecosAggregated[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	})
};
export const useUserRecosMovieQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'created_at' | 'random';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recos({
			userId: userId!,
			type: 'movie',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
					.from(filters?.sortBy === 'random' ? 'user_recos_movie_aggregated_random' : 'user_recos_movie_aggregated')
					.select(`
						*,
						movie:media_movie(*)
					`)
					.match({
						'user_id': userId,
						'status': 'active',
					});
			
			const mergedFilters = {
				sortBy: 'created_at',
				sortOrder: 'asc',
				...filters
			};

			if (mergedFilters) {
				if (mergedFilters.sortBy !== 'random') {
					switch (mergedFilters.sortBy) {
						default:
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
					}
				}

				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request
				.overrideTypes<UserRecosMovieAggregated[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
export const useUserRecosTvSeriesQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'created_at' | 'random';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recos({
			userId: userId!,
			type: 'tv_series',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
					.from(filters?.sortBy === 'random' ? 'user_recos_tv_series_aggregated_random' : 'user_recos_tv_series_aggregated')
					.select(`
						*,
						tv_series:media_tv_series(*)
					`)
					.match({
						'user_id': userId,
						'status': 'active',
					});

			const mergedFilters = {
				sortBy: 'created_at',
				sortOrder: 'asc',
				...filters
			};

			if (mergedFilters) {
				if (mergedFilters.sortBy !== 'random') {
					switch (mergedFilters.sortBy) {
						default:
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
					}
				}

				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request
				.overrideTypes<UserRecosTvSeriesAggregated[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

// ========== SEND ========== //
// Movies
export const useUserRecosMovieSendQuery = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recosSend({
			id: movieId,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_friend')
				.select(`
					id,
					friend:profile!user_friend_friend_id_fkey!inner(
						*,
						user_activities_movie(count),
						user_recos_movie!user_recos_movie_user_id_fkey(count)
					)
				`)
				.match({
					'user_id': userId,
					'friend.user_activities_movie.movie_id': movieId,
					'friend.user_recos_movie.movie_id': movieId,
					'friend.user_recos_movie.sender_id': userId,
					'friend.user_recos_movie.status': 'active',
				})
				.overrideTypes<(UserFriend & {
					friend: {
						user_activities_movie: {
							count: number;
						}[];
						user_recos_movie: {
							count: number;
						}[];
					};
				})[]>();
			if (error) throw error;
			const output = data?.map((userFriend) => ({
				friend: userFriend.friend,
				as_watched: userFriend.friend.user_activities_movie[0]?.count > 0,
				already_sent: userFriend.friend.user_recos_movie[0]?.count > 0,
			}));
			return output;
		},
		enabled: !!userId && !!movieId,
	});
};
// Tv Series
export const useUserRecosTvSeriesSendQuery = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recosSend({
			id: tvSeriesId,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_friend')
				.select(`
					id,
					friend:profile!user_friend_friend_id_fkey!inner(
						*,
						user_activities_tv_series(count),
						user_recos_tv_series!user_recos_tv_series_user_id_fkey(count)
					)
				`)
				.match({
					'user_id': userId,
					'friend.user_activities_tv_series.tv_series_id': tvSeriesId,
					'friend.user_recos_tv_series.tv_series_id': tvSeriesId,
					'friend.user_recos_tv_series.sender_id': userId,
					'friend.user_recos_tv_series.status': 'active',
				})
				.overrideTypes<(UserFriend & {
					friend: {
						user_activities_tv_series: {
							count: number;
						}[];
						user_recos_tv_series: {
							count: number;
						}[];
					};
				})[]>();
			if (error) throw error;
			const output = data?.map((userFriend) => ({
				friend: userFriend.friend,
				as_watched: userFriend.friend.user_activities_tv_series[0]?.count > 0,
				already_sent: userFriend.friend.user_recos_tv_series[0]?.count > 0,
			}));
			return output;
		},
		enabled: !!userId && !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- WATCHLIST ------------------------------- */
export const useUserWatchlistQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'created_at' | 'random';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlist({
			userId: userId!,
			type: 'all',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = filters?.sortBy === 'random'
				? supabase.from('user_watchlists_random').select('*').match({ 'user_id': userId, 'status': 'active' })
				: supabase.from('user_watchlists').select('*').match({ 'user_id': userId, 'status': 'active' });

				const mergedFilters = {
					sortBy: 'created_at',
					sortOrder: 'asc',
					...filters,
				};
			if (mergedFilters) {
				if (mergedFilters?.sortBy !== 'random') {
					switch (mergedFilters.sortBy) {
						default: request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
					}
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}

			const { data, error } = await request
				.overrideTypes<UserWatchlist[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
export const useUserWatchlistMoviesQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlist({
			userId: userId!,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlists_movie')
				.select(`*, movie:media_movie(*)`)
				.match({
					'user_id': userId,
					'status': 'active',
				});
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
export const useUserWatchlistTvSeriesQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlist({
			userId: userId!,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlists_tv_series')
				.select(`*, tv_series:media_tv_series(*)`)
				.match({
					'user_id': userId,
					'status': 'active',
				});
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserWatchlistMovieItemQuery = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlistItem({
			id: movieId!,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!movieId) throw Error('Missing movie id');
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlists_movie')
				.select(`*`)
				.match({
					'user_id': userId,
					'movie_id': movieId,
					'status': 'active',
				})
				.maybeSingle()
				.overrideTypes<UserWatchlistMovie>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!movieId,
	});
};
export const useUserWatchlistTvSeriesItemQuery = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlistItem({
			id: tvSeriesId!,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!tvSeriesId) throw Error('Missing tv series id');
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlists_tv_series')
				.select(`*`)
				.match({
					'user_id': userId,
					'tv_series_id': tvSeriesId,
					'status': 'active',
				})
				.maybeSingle()
				.overrideTypes<UserWatchlistTvSeries>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- LIKES --------------------------------- */
// Movies
export const useUserHeartPicksMovieQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'liked_at' | 'random';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.heartPicks({
			userId: userId!,
			type: 'movie',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from('user_activities_movie')
				.select(`*, movie:media_movie(*)`)
				.match({
					'user_id': userId,
					'is_liked': true,
				})

			const mergedFilters = {
				sortBy: 'liked_at',
				sortOrder: 'desc',
				...filters
			} as typeof filters;

			if (mergedFilters) {
				if (mergedFilters?.sortBy !== 'random') {
					switch (mergedFilters.sortBy) {
						default: request = request.order('liked_at', { ascending: mergedFilters.sortOrder === 'asc' });
					}
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}

			const { data, error } = await request
				.overrideTypes<UserActivityMovie[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
// TV Series
export const useUserHeartPicksTvSeriesQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'liked_at' | 'random';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.heartPicks({
			userId: userId!,
			type: 'tv_series',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from('user_activities_tv_series')
				.select(`*, tv_series:media_tv_series(*)`)
				.match({
					'user_id': userId,
					'is_liked': true,
				})

			const mergedFilters = {
				sortBy: 'liked_at',
				sortOrder: 'desc',
				...filters
			} as typeof filters;

			if (mergedFilters) {
				if (mergedFilters?.sortBy !== 'random') {
					switch (mergedFilters.sortBy) {
						default: request = request.order('liked_at', { ascending: mergedFilters.sortOrder === 'asc' });
					}
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}

			const { data, error } = await request
				.overrideTypes<UserActivityTvSeries[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- FEED ---------------------------------- */
export const useUserFeedInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		perPage?: number;
		sortBy?: 'created_at';
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
		queryKey: userKeys.feed({
			userId: userId as string,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.perPage;
			const { data, error } = await  supabase
				.rpc('get_feed', {
					page_limit: mergedFilters.perPage,
					page_offset: from
				})
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserFeedCastCrewInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.feedCastCrew({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.perPage;
			const { data, error } = await  supabase
				.rpc('get_feed_cast_crew', {
					page_limit: mergedFilters.perPage,
					page_offset: from
				})
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLIST -------------------------------- */
export const useUserPlaylistsInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string | null;
	filters?: {
		sortBy?: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		sortBy: 'updated_at',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.playlists({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.perPage;
	  		let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('playlists')
				.select(`*, user:profile(*)`)
				.eq('user_id', userId)
				.range(from, to)

				if (mergedFilters) {
					if (mergedFilters.sortBy && mergedFilters?.sortOrder) {
						switch (mergedFilters.sortBy) {
							case 'created_at':
								request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
								break;
							case 'updated_at':
								request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

// Likes
export const useUserPlaylistLikeQuery = ({
	userId,
	playlistId,
} : {
	userId?: string;
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.playlistLike({
			userId: userId!,
			playlistId: playlistId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlists_likes')
				.select('*')
				.eq('user_id', userId)
				.eq('playlist_id', playlistId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!playlistId,
	});
};

// Saved
export const useUserPlaylistsSavedInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		resultsPerPage?: number;
		sortBy?: 'created_at';
		sortOrder?: 'asc' | 'desc';
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		sortBy: 'created_at',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.playlistsSaved({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
	  		let to = from - 1 + mergedFilters.resultsPerPage;
			let request = supabase
				.from('playlists_saved')
				.select(`*, playlist:playlists(*, user:profile(*))`)
				.eq('user_id', userId)
				.range(from, to)

			if (mergedFilters) {
				if (mergedFilters.sortBy) {
					switch (mergedFilters.sortBy) {
						case 'created_at':
							request = request.order('created_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
			return lastPage?.length === mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserPlaylistSavedQuery = ({
	userId,
	playlistId,
} : {
	userId?: string;
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.playlistSaved({
			userId: userId as string,
			playlistId: playlistId as number,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlists_saved')
				.select('*')
				.eq('user_id', userId)
				.eq('playlist_id', playlistId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!playlistId,
	});
};

/**
 * Fetches the user playlists
 * @param userId The user id
 * @param filters The filters
 * @returns The user playlists
*/
export const useUserPlaylists = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		order?: "updated_at-desc" | "updated_at-asc";
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.playlists({
			userId: userId as string,
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from('playlists')
				.select('*')
				.eq('user_id', userId)
			
			if (filters) {
				if (filters.order) {
					switch (filters.order) {
						case 'updated_at-desc':
							request = request.order('updated_at', { ascending: false });
							break;
						case 'updated_at-asc':
							request = request.order('updated_at', { ascending: true });
							break;
					}
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserPlaylistsFriendsInfinite = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		resultsPerPage?: number;
		order?:
			'updated_at-desc' |
			'updated_at-asc' |
			'created_at-desc' |
			'created_at-asc' |
			'likes_count-desc' |
			'likes_count-asc';
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		order: 'updated_at-desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.playlistsFriends({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
      		let to = from - 1 + mergedFilters.resultsPerPage;
			
			let request = supabase
				.from('playlists_friends')
				.select(`
					*,
					user:profile(*)
				`)
				.range(from, to)
				.returns<Playlist[]>();
			
			if (mergedFilters) {
				if (mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					request = request.order(column, { ascending: direction === 'asc' });
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

/* -------------------------------------------------------------------------- */

/* -------------------------------- FOLLOWER -------------------------------- */

export const useUserFollowersInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.followers(userId as string, filters),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.perPage;
			let to = from - 1 + mergedFilters.perPage;

			let query = supabase
				.from('user_follower')
				.select('id, follower:profile!user_follower_user_id_fkey!inner(*)')
				.eq('followee_id', userId)
				.eq('is_pending', false)
				.order('created_at', { ascending: false })
				.range(from, to);
			
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (data, pages) => {
			return data?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserFollowersRequestsQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.followersRequests(userId as string),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_follower')
				.select('id, user:profile!user_follower_user_id_fkey!inner(*)')
				.eq('followee_id', userId)
				.eq('is_pending', true)
				.overrideTypes<UserFollower[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserFolloweesInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		perPage?: number;
	};
}) => {
	const mergedFilters = {
		perPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.followees(userId as string, filters),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * mergedFilters.perPage;
			let to = from - 1 + mergedFilters.perPage;

			let query = supabase
				.from('user_follower')
				.select('id, followee:profile!user_follower_followee_id_fkey!inner(*)')
				.eq('user_id', userId)
				.eq('is_pending', false)
				.order('created_at', { ascending: false })
				.range(from, to)
			
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (data, pages) => {
			return data?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- ACCOUNT -------------------------------- */
export const useUserDeleteRequestQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.deleteRequest({ userId: userId! }),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_deletion_requests')
				.select('*')
				.eq('user_id', userId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserDiscoveryInfinite = ({
	filters,
} : {
	filters?: {
		resultsPerPage?: number;
		order?: 'created_at-desc' | 'created_at-asc' | 'popularity-desc' | 'popularity-asc';
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		order: 'created_at-desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.discovery({
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
	  		let to = from - 1 + mergedFilters.resultsPerPage;
			let request = supabase
				.from('profile')
				.select(`*`)
				.range(from, to);

			if (mergedFilters) {
				if (mergedFilters.order) {
					switch (mergedFilters.order) {
						case 'created_at-desc':
							request = request.order('created_at', { ascending: false });
							break;
						case 'created_at-asc':
							request = request.order('created_at', { ascending: true });
							break;
						case 'popularity-desc':
							request = request.order('followers_count', { ascending: false });
							break;
						case 'popularity-asc':
							request = request.order('followers_count', { ascending: true });
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
			return lastPage?.length === mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
	});
};

export const useUserFollowProfileQuery = ({
	userId,
	followeeId,
} : {
	userId?: string;
	followeeId?: string | null;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.followProfile(userId as string, followeeId as string),
		queryFn: async () => {
			if (!userId || !followeeId) throw Error('Missing user id or followee id');
			const { data, error } = await supabase
				.from('user_follower')
				.select('*')
				.eq('user_id', userId)
				.eq('followee_id', followeeId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!followeeId && userId !== followeeId,
	});
};


export const useUserFollowPersonQuery = ({
	userId,
	personId,
} : {
	userId?: string;
	personId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.followPerson(userId!, personId!),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!personId) throw Error('Missing person id');
			const { data, error } = await supabase
				.from('user_person_follower')
				.select('*')
				.match({
					user_id: userId,
					person_id: personId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!personId,
	});
};