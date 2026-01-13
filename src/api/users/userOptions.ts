import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { UserRecosAggregated, UserRecosMovieAggregated, UserRecosTvSeriesAggregated, UserWatchlist } from "@recomendapp/types";
import { userKeys } from "./userKeys";
import { SupabaseClient } from "@/lib/supabase/client";

export const userProfileOptions = ({
	supabase,
	username,
} : {
	supabase: SupabaseClient;
	username?: string;
}) => {
	return queryOptions({
		queryKey: userKeys.profile({ username: username! }),
		queryFn: async () => {
			if (!username) return null;
			const { data, error } = await supabase
				.from('profile')
				.select('*')
				.eq('username', username)
				.maybeSingle()
			if (error) throw error;
			return data;
		},
		enabled: !!username,
	});
};

/* --------------------------------- FOLLOWS -------------------------------- */
export const userFollowersOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.followers({
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
			return data?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
export const userFolloweesOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.followees({
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
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};
export const userFollowersRequestsOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.followersRequests({
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
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const userFollowProfileOptions = ({
	supabase,
	userId,
	profileId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	profileId?: string;
}) => {
	return queryOptions({
		queryKey: userKeys.followProfile({
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

export const userFollowPersonOptions = ({
	supabase,
	userId,
	personId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	personId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.followPerson({
			userId: userId!,
			personId: personId!,
		}),
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
/* -------------------------------------------------------------------------- */

/* ---------------------------------- FEED ---------------------------------- */
export const userMyFeedOptions = ({
	supabase,
	filters,
} : {
	supabase: SupabaseClient;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.myFeed({
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * PER_PAGE;
			let request = supabase
				.rpc('get_feed', {
					page_limit: PER_PAGE,
					page_offset: from,
				});
			
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'created_at':
						request = request.order('created_at', { ascending: filters.sortOrder === 'asc' });
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
	})
};
export const userMyFeedCastCrewOptions = ({
	supabase,
	enabled = false,
} : {
	supabase: SupabaseClient;
	enabled?: boolean;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.myFeedCastCrew(),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * PER_PAGE;
			const { data, error } = await  supabase
				.rpc('get_feed_cast_crew', {
					page_limit: PER_PAGE,
					page_offset: from
				})
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: enabled,
	});
};
// export const useUserFeedOptions = ({
// 	supabase,
// 	userId,
// 	filters,
// } : {
// 	supabase: SupabaseClient;
// 	userId?: string;
// 	filters: {
// 		sortBy: 'created_at';
// 		sortOrder: 'asc' | 'desc';
// 	}
// }) => {
// 	const PER_PAGE = 20;
// 	return infiniteQueryOptions({
// 		queryKey: userKeys.feed({
// 			userId: userId!,
// 			filters: filters,
// 		}),
// 		queryFn: async ({ pageParam = 1 }) => {
// 			if (!userId) throw new Error('User ID is required');
// 			let from = (pageParam - 1) * PER_PAGE;
// 			let request = supabase
// 				.rpc('get_feed', {
// 					page_limit: PER_PAGE,
// 					page_offset: from,
// 					target_user_ids: [userId],
// 				});
			
// 			if (filters.sortBy && filters.sortOrder) {
// 				switch (filters.sortBy) {
// 					case 'created_at':
// 						request = request.order('created_at', { ascending: mergeFilters.sortOrder === 'asc' });
// 						break;
// 				}
// 			}

// 			const { data, error } = await request;
// 			if (error) throw error;
// 			return data;
// 		},
// 		initialPageParam: 1,
// 		getNextPageParam: (lastPage, pages) => {
// 			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
// 		},
// 		enabled: !!userId,
// 	})
// };
/* -------------------------------------------------------------------------- */

/* ------------------------------- Activities ------------------------------- */
export const userActivitiesOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'watched_date' | 'rating';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.activities({
			userId: userId!,
			type: 'all',
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * PER_PAGE;
	  		let to = from + PER_PAGE - 1;
			let request = supabase
				.from('user_activities')
				.select(`*`)
				.eq('user_id', userId)
				.range(from, to)
			
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'watched_date':
						request = request.order('watched_date', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'rating':
						request = request
							.not('rating', 'is', null)
							.order('rating', { ascending: filters.sortOrder === 'asc' });
						break;
					default:
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
		enabled: !!userId,
	});
};
export const userActivitiesMovieOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'watched_date' | 'rating';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.movieActivities({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			
			let from = (pageParam - 1) * PER_PAGE;
			let to = from + PER_PAGE - 1;

			let request = supabase
				.from('user_activities_movie')
				.select('*, movie:media_movie(*)')
				.eq('user_id', userId)
				.range(from, to);
			
			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'watched_date':
						request = request.order('watched_date', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'rating':
						request = request
							.not('rating', 'is', null)
							.order('rating', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}

			const { data, error } = await request
				// .overrideTypes<UserActivityMovie[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};
export const userActivitiesTvSeriesOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'watched_date' | 'rating';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.tvSeriesActivities({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			
			let from = (pageParam - 1) * PER_PAGE;
			let to = from + PER_PAGE - 1;

			let request = supabase
				.from('user_activities_tv_series')
				.select('*, tv_series:media_tv_series(*)')
				.eq('user_id', userId)
				.range(from, to);

			if (filters.sortBy && filters.sortOrder) {
				switch (filters.sortBy) {
					case 'watched_date':
						request = request.order('watched_date', { ascending: filters.sortOrder === 'asc' });
						break;
					case 'rating':
						request = request
							.not('rating', 'is', null)
							.order('rating', { ascending: filters.sortOrder === 'asc' });
						break;
				}
			}

			const { data, error } = await request
				// .overrideTypes<UserActivityTvSeries[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};

export const userActivityMovieOptions = ({
	supabase,
	userId,
	movieId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	movieId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.activity({
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
export const userActivityTvSeriesOptions = ({
	supabase,
	userId,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.activity({
			id: tvSeriesId!,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!tvSeriesId) throw Error('Missing tv series id');
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
export const userReviewMovieOptions = ({
	supabase,
	reviewId,
} : {
	supabase: SupabaseClient;
	reviewId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.review({
			id: reviewId!,
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
		queryKey: userKeys.reviewLike({
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

export const userReviewTvSeriesOptions = ({
	supabase,
	reviewId,
} : {
	supabase: SupabaseClient;
	reviewId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.review({
			id: reviewId!,
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
		queryKey: userKeys.reviewLike({
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

/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
export const userRecosOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc' | 'random';
		limit?: number;
	};
}) => {
	return queryOptions({
		queryKey: userKeys.recos({
			userId: userId!,
			type: 'all',
			filters,
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
export const userRecosMovieOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
		queryKey: userKeys.recos({
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
export const userRecosTvSeriesOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
		queryKey: userKeys.recos({
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

export const userRecosMovieSendOptions = ({
	supabase,
	userId,
	movieId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	movieId: number;
}) => {
	return queryOptions({
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
export const userRecosTvSeriesSendOptions = ({
	supabase,
	userId,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	tvSeriesId: number;
}) => {
	return queryOptions({
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
export const userWatchlistOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc' | 'random';
		limit: number;
	}
}) => {
	return queryOptions({
		queryKey: userKeys.watchlist({
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
			const { data, error } = await request
				.overrideTypes<UserWatchlist[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};
export const userWatchlistMoviesOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
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
export const userWatchlistTvSeriesOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
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

export const userWatchlistMovieItemOptions = ({
	supabase,
	userId,
	movieId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	movieId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.watchlistItem({
			id: movieId!,
			type: 'movie',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!movieId) throw Error('Missing movie id');
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
export const userWatchlistTvSeriesItemOptions = ({
	supabase,
	userId,
	tvSeriesId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	tvSeriesId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.watchlistItem({
			id: tvSeriesId!,
			type: 'tv_series',
			userId: userId!,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!tvSeriesId) throw Error('Missing tv series id');
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
export const userHeartPicksMovieOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
		queryKey: userKeys.heartPicks({
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

export const userHeartPicksTvSeriesOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
		queryKey: userKeys.heartPicks({
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
export const userPlaylistsOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.playlists({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * PER_PAGE;
			let to = from + PER_PAGE - 1;

			let request = supabase
				.from('playlists')
				.select('*, user:profile(*)')
				.eq('user_id', userId)
				.range(from, to);
			
			if (filters) {
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
			}

			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
};

export const userPlaylistsSavedOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.playlistsSaved({
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

export const userPlaylistSavedOptions = ({
	supabase,
	userId,
	playlistId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	playlistId?: number;
}) => {
	return queryOptions({
		queryKey: userKeys.playlistSaved({
			userId: userId!,
			playlistId: playlistId!,
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
			return !!data;
		},
		enabled: !!userId && !!playlistId,
	});
};

export const userPlaylistsFriendOptions = ({
	supabase,
	userId,
	filters,
} : {
	supabase: SupabaseClient;
	userId?: string;
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: userKeys.playlistsFriends({
			userId: userId!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * PER_PAGE;
			let to = from + PER_PAGE - 1;
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
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	})
}

export const userPlaylistLikeOptions = ({
	supabase,
	userId,
	playlistId,
} : {
	supabase: SupabaseClient;
	userId?: string;
	playlistId?: number;
}) => {
	return queryOptions({
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
			return !!data;
		},
		enabled: !!userId && !!playlistId,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- ACCOUNT -------------------------------- */
export const userDeleteRequestOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
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
/* -------------------------------------------------------------------------- */