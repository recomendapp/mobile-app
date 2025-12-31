import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { UserRecosAggregated, UserRecosMovieAggregated, UserRecosTvSeriesAggregated } from "@recomendapp/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { usersKeys } from "./usersKeys";
import { useAuth } from "@/providers/AuthProvider";
import { SupabaseClient } from "@/lib/supabase/client";

export const useUserOptions = ({
	userId,
} : {
	userId?: string
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.details({ userId: userId!}),
		queryFn: async () => {
			if (!userId) return null;
			const { data, error } = await supabase
				.from('user')
				.select('*')
				.eq('id', userId)
				.single();
			if (error) throw error;
			return data;	
		},
		enabled: !!userId,
	});
};

/* --------------------------------- FOLLOWS -------------------------------- */
export const useUserFollowersOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const PER_PAGE = 20;
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.followers({
			userId: userId!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * PER_PAGE;
			let to = from - 1 + PER_PAGE;

			const { data, error } = await supabase
				.from('user_follower')
				.select('id, follower:profile!user_follower_user_id_fkey!inner(*)')
				.eq('followee_id', userId)
				.eq('is_pending', false)
				.range(from, to);
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (data, pages) => {
			return data?.length == PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
export const useUserFolloweesOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const PER_PAGE = 20;
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.followees({
			userId: userId!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			const { data, error } = await supabase
				.from('user_follower')
				.select('id, followee:profile!user_follower_followee_id_fkey!inner(*)')
				.eq('user_id', userId)
				.eq('is_pending', false)
				.range(from, to);
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
export const useUserFollowersRequestsOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const PER_PAGE = 20;
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.followersRequests({
			userId: userId!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			const from = (pageParam - 1) * PER_PAGE;
			const to = from + PER_PAGE - 1;
			const { data, error } = await supabase
				.from('user_follower')
				.select('id, user:profile!user_follower_user_id_fkey!inner(*)')
				.eq('followee_id', userId)
				.eq('is_pending', true)
				.range(from, to);
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserFollowProfileOptions = ({
	userId,
	profileId,
} : {
	userId?: string;
	profileId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.followProfile({
			userId: userId!,
			profileId: profileId!,
		}),
		queryFn: async () => {
			if (!userId || !profileId) throw Error('Missing user id or profile id');
			const { data, error } = await supabase
				.from('user_follower')
				.select('*')
				.eq('user_id', userId)
				.eq('followee_id', profileId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!profileId,
	});
};

export const useUserFollowPersonOptions = ({
	userId,
	personId,
} : {
	userId?: string;
	personId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.followPerson({
			userId: userId!,
			personId: personId,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
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
/* -------------------------------------------------------------------------- */

/* ---------------------------------- FEED ---------------------------------- */
export const useUserMyFeedInfiniteOptions = ({
	filters,
} : {
	filters?: {
		sortBy?: 'created_at';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	}
} = {}) => {
	const supabase = useSupabaseClient();
	const mergeFilters = {
		sortBy: 'created_at',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	return infiniteQueryOptions({
		queryKey: usersKeys.myFeed({
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergeFilters.perPage;
			let request = supabase
				.rpc('get_feed', {
					page_limit: mergeFilters.perPage,
					page_offset: from,
				});
			
			if (mergeFilters) {
				if (mergeFilters.sortBy && mergeFilters.sortOrder) {
					switch (mergeFilters.sortBy) {
						case 'created_at':
							request = request.order('created_at', { ascending: mergeFilters.sortOrder === 'asc' });
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
			return lastPage?.length == mergeFilters.perPage ? pages.length + 1 : undefined;
		},
	})
};
export const useUserMyFeedCastCrewOptions = ({
	enabled,
} : {
	enabled?: boolean;
}) => {
	const PER_PAGE = 20;
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.myFeedCastCrew(),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * PER_PAGE;
	  		let to = from - 1 + PER_PAGE;
			const { data, error } = await supabase
				.from('user_feed_cast_crew')
				.select(`
					*,
					movie:media_movie!inner(*),
					person:media_person(name,profile_url,url)
				`)
				.not('movie.release_date', 'is', null)
				.order('movie(release_date)', { ascending: false })
				.range(from, to);
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: enabled,
	});
};
export const useUserFeedInfiniteOptions = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'created_at';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	}
}) => {
	const supabase = useSupabaseClient();
	const mergeFilters = {
		sortBy: 'created_at',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	return infiniteQueryOptions({
		queryKey: usersKeys.feed({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw new Error('User ID is required');
			let from = (pageParam - 1) * mergeFilters.perPage;
			let request = supabase
				.rpc('get_feed', {
					page_limit: mergeFilters.perPage,
					page_offset: from,
					target_user_ids: [userId],
				});
			
			if (mergeFilters) {
				if (mergeFilters.sortBy && mergeFilters.sortOrder) {
					switch (mergeFilters.sortBy) {
						case 'created_at':
							request = request.order('created_at', { ascending: mergeFilters.sortOrder === 'asc' });
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
			return lastPage?.length == mergeFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};
/* -------------------------------------------------------------------------- */

/* ------------------------------- Activities ------------------------------- */
export const useUserActivitiesMovieInfiniteOptions = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'watched_date' | 'rating';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	}
}) => {
	const supabase = useSupabaseClient();
	const mergeFilters = {
		sortBy: 'watched_date',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	return infiniteQueryOptions({
		queryKey: usersKeys.movieActivities({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) return null;
			
			let from = (pageParam - 1) * mergeFilters.perPage;
			let to = from + mergeFilters.perPage - 1;

			let request = supabase
				.from('user_activities_movie')
				.select('*, movie:media_movie(*)')
				.eq('user_id', userId)
				.range(from, to);
			
			if (mergeFilters) {
				if (mergeFilters.sortBy && mergeFilters.sortOrder) {
					switch (mergeFilters.sortBy) {
						case 'watched_date':
							request = request.order('watched_date', { ascending: mergeFilters.sortOrder === 'asc' });
							break;
						case 'rating':
							request = request
								.not('rating', 'is', null)
								.order('rating', { ascending: mergeFilters.sortOrder === 'asc' });
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
			return lastPage?.length == mergeFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};
export const useUserActivitiesTvSeriesInfiniteOptions = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		sortBy?: 'watched_date' | 'rating';
		sortOrder?: 'asc' | 'desc';
		perPage?: number;
	}
}) => {
	const supabase = useSupabaseClient();
	const mergeFilters = {
		sortBy: 'watched_date',
		sortOrder: 'desc',
		perPage: 20,
		...filters,
	};
	return infiniteQueryOptions({
		queryKey: usersKeys.tvSeriesActivities({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) return null;
			
			let from = (pageParam - 1) * mergeFilters.perPage;
			let to = from + mergeFilters.perPage - 1;

			let request = supabase
				.from('user_activities_tv_series')
				.select('*, tv_series:media_tv_series(*)')
				.eq('user_id', userId)
				.range(from, to);
			
			if (mergeFilters) {
				if (mergeFilters.sortBy && mergeFilters.sortOrder) {
					switch (mergeFilters.sortBy) {
						case 'watched_date':
							request = request.order('watched_date', { ascending: mergeFilters.sortOrder === 'asc' });
							break;
						case 'rating':
							request = request
								.not('rating', 'is', null)
								.order('rating', { ascending: mergeFilters.sortOrder === 'asc' });
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
			return lastPage?.length == mergeFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};

export const useUserActivityMovieOptions = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.activity({
			id: movieId!,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!movieId) throw Error('Missing movie id');
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
export const useUserActivityTvSeriesOptions = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.activity({
			id: tvSeriesId,
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
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const useUserReviewMovieOptions = ({
	reviewId,
} : {
	reviewId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.review({
			id: reviewId,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_reviews_movie')
				.select('*, activity:user_activities_movie(*, movie:media_movie(*), user:profile(*))')
				.eq('id', reviewId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		// initialData: initialData,
		enabled: !!reviewId,
	});
};

export const userReviewMovieLikeOptions = ({
	supabase,
	userId,
	reviewId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	reviewId?: number;
}) => {
	return queryOptions({
		queryKey: usersKeys.reviewLike({
			reviewId: reviewId!,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_review_movie_likes')
				.select('*')
				.match({
					'user_id': userId,
					'review_id': reviewId,
				})
				.maybeSingle();
			if (error) throw error;
			return !!data;
		},
		enabled: !!userId && !!reviewId,
	});
};
export const useUserReviewMovieLikeOptions = ({
	userId,
	reviewId,
} : {
	userId?: string;
	reviewId?: number;
}) => {
	const supabase = useSupabaseClient();
	return userReviewMovieLikeOptions({
		supabase,
		userId,
		reviewId,
	});
};

export const useUserReviewTvSeriesOptions = ({
	reviewId,
	// initialData,
} : {
	reviewId: number;
	// initialData?: UserReviewTvSeries;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.review({
			id: reviewId,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_reviews_tv_series')
				.select('*, activity:user_activities_tv_series(*, tv_series:media_tv_series(*), user:profile(*))')
				.eq('id', reviewId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		// initialData: initialData,
		enabled: !!reviewId,
	});
};

export const userReviewTvSeriesLikeOptions = ({
	supabase,
	userId,
	reviewId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	reviewId?: number;
}) => {
	return queryOptions({
		queryKey: usersKeys.reviewLike({
			reviewId: reviewId!,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_review_tv_series_likes')
				.select('*')
				.match({
					'user_id': userId,
					'review_id': reviewId,
				})
				.maybeSingle();
			if (error) throw error;
			return !!data;
		},
		enabled: !!userId && !!reviewId,
	});
};
export const useUserReviewTvSeriesLikeOptions = ({
	userId,
	reviewId,
} : {
	userId?: string;
	reviewId?: number;
}) => {
	const supabase = useSupabaseClient();
	return userReviewTvSeriesLikeOptions({
		supabase,
		userId,
		reviewId,
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
export const useUserRecosOptions = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc' | 'random';
		limit: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.recos({
			userId: userId!,
			type: 'all',
			filters: filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from(filters.sortOrder === 'random' ? 'user_recos_aggregated_random' : 'user_recos_aggregated')
				.select('*')
				.match({
					'user_id': userId,
					'status': 'active',
				})
			
			if (filters) {
				if (filters.sortOrder !== 'random') {
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
export const useUserRecosMovieOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.recos({
			userId: userId!,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_recos_movie_aggregated')
				.select(`
					*,
					movie:media_movie(*)
				`)
				.match({
					'user_id': userId,
					'status': 'active',
				})
				.order('created_at', { ascending: false })
				.overrideTypes<UserRecosMovieAggregated[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
export const useUserRecosTvSeriesOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.recos({
			userId: userId!,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_recos_tv_series_aggregated')
				.select(`
					*,
					tv_series:media_tv_series(*)
				`)
				.match({
					'user_id': userId,
					'status': 'active',
				})
				.order('created_at', { ascending: false })
				.overrideTypes<UserRecosTvSeriesAggregated[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserRecosMovieSendOptions = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.recosSend({
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
				// .overrideTypes<(UserFriend & {
				// 	friend: {
				// 		user_activities_movie: {
				// 			count: number;
				// 		}[];
				// 		user_recos_movie: {
				// 			count: number;
				// 		}[];
				// 	};
				// })[]>();
			if (error) throw error;
			const output = data?.map((userFriend) => ({
				friend: userFriend.friend,
				as_watched: userFriend.friend.user_activities_movie[0]?.count > 0,
				already_sent: userFriend.friend.user_recos_movie[0]?.count > 0,
			}));
			return output;
		},
		enabled: !!userId,
	});
};
export const useUserRecosTvSeriesSendOptions = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.recosSend({
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
				// .overrideTypes<(UserFriend & {
				// 	friend: {
				// 		user_activities_tv_series: {
				// 			count: number;
				// 		}[];
				// 		user_recos_tv_series: {
				// 			count: number;
				// 		}[];
				// 	};
				// })[]>();
			if (error) throw error;
			const output = data?.map((userFriend) => ({
				friend: userFriend.friend,
				as_watched: userFriend.friend.user_activities_tv_series[0]?.count > 0,
				already_sent: userFriend.friend.user_recos_tv_series[0]?.count > 0,
			}));
			return output;
		},
		enabled: !!userId,
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- WATCHLIST ------------------------------- */
export const useUserWatchlistOptions = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc' | 'random';
		limit: number;
	}
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.watchlist({
			userId: userId!,
			type: 'all',
			filters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = filters.sortOrder === 'random'
				? supabase.from('user_watchlists_random').select('*').match({ 'user_id': userId, 'status': 'active' })
				: supabase.from('user_watchlists').select('*').match({ 'user_id': userId, 'status': 'active' });

			if (filters) {
				if (filters.sortOrder !== 'random') {
					switch (filters.sortBy) {
						default: request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
					}
				}
				if (filters.limit) {
					request = request.limit(filters.limit);
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
export const useUserWatchlistMoviesOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.watchlist({
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
export const useUserWatchlistTvSeriesOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.watchlist({
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

export const useUserWatchlistMovieItemOptions = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.watchlistItem({
			id: movieId,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlists_movie')
				.select(`*`)
				.match({
					'user_id': userId,
					'movie_id': movieId,
					'status': 'active',
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!movieId,
	});
};
export const useUserWatchlistTvSeriesItemOptions = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.watchlistItem({
			id: tvSeriesId,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlists_tv_series')
				.select(`*`)
				.match({
					'user_id': userId,
					'tv_series_id': tvSeriesId,
					'status': 'active',
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!tvSeriesId,
	});
};
/* -------------------------------------------------------------------------- */

/* ------------------------------- HEART PICKS ------------------------------ */
export const useUserHeartPicksMovieOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.heartPicks({
			userId: userId!,
			type: 'movie',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activities_movie')
				.select(`*, movie:media_movie(*)`)
				.match({
					'user_id': userId,
					'is_liked': true,
				});
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserHeartPicksTvSeriesOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.heartPicks({
			userId: userId!,
			type: 'tv_series',
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activities_tv_series')
				.select(`*, tv_series:media_tv_series(*)`)
				.match({
					'user_id': userId,
					'is_liked': true,
				});
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
/* -------------------------------------------------------------------------- */

/* ------------------------------- Playlists ------------------------------- */
export const useUserPlaylistsInfiniteOptions = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'updated_at';
		sortOrder: 'asc' | 'desc';	}
}) => {
	const PER_PAGE = 20;
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.playlists({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) return null;
			
			let from = (pageParam - 1) * PER_PAGE;
			let to = from + PER_PAGE - 1;

			let request = supabase
				.from('playlists')
				.select('*')
				.eq('user_id', userId)
				.range(from, to);
			
			if (filters) {
				if (filters.sortBy && filters.sortOrder) {
					switch (filters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
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
			return lastPage?.length == PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};

export const useUserPlaylistsSavedOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const PER_PAGE = 20;
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.playlistsSaved({
			userId: userId!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			const from = (pageParam - 1) * PER_PAGE;
	  		const to = from + PER_PAGE - 1;
			let request = supabase
				.from('playlists_saved')
				.select(`*, playlist:playlists(*, user:profile(*))`)
				.eq('user_id', userId)
				.range(from, to)
				.order('created_at', { ascending: false });

			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserPlaylistSavedOptions = ({
	userId,
	playlistId,
} : {
	userId?: string;
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.playlistSaved({
			userId: userId!,
			playlistId: playlistId,
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

export const useUserPlaylistsFriendOptions = ({
	filters,
} : {
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const perPage = 20;
	const { session } = useAuth();
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: usersKeys.playlistsFriends({
			userId: session?.user.id!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!session?.user.id) return null;
			
			let from = (pageParam - 1) * perPage;
			let to = from + perPage - 1;
			let request = supabase
				.from('playlists_friends')
				.select('*, user:profile(*)')
				.range(from, to);
			
			if (filters) {
				if (filters.sortBy && filters.sortOrder) {
					switch (filters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
							break;
						case 'created_at':
							request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
							break;
						case 'likes_count':
							request = request.order('likes_count', { ascending: filters.sortOrder === 'asc' });
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
			return lastPage?.length == perPage ? pages.length + 1 : undefined;
		},
		enabled: !!session?.user.id,
	})
}
/* -------------------------------------------------------------------------- */

/* --------------------------------- ACCOUNT -------------------------------- */
export const useUserDeleteRequestOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: usersKeys.deleteRequest({ userId: userId! }),
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
/* -------------------------------------------------------------------------- */