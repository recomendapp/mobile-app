import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { userKeys } from "./userKeys"
import { UserFeedCastCrew, Playlist, UserActivity, UserFollower, UserFriend, UserRecosAggregated, UserReview, UserWatchlist, PlaylistType } from "@/types/type.db";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { playlistKeys } from "../playlist/playlistKeys";

/* ---------------------------------- USER ---------------------------------- */

/**
 * Fetches the user details
 * @param userId The user id
 * @returns The user details
*/
export const useUserQuery = ({
	userId,
	enabled,
} : {
	userId?: string
	enabled?: boolean
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.detail(userId as string),
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
		enabled: enabled ? enabled : userId !== undefined,
	});
};

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
				.maybeSingle();
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
	userId?: string | null;
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
				.from('user_activity')
				.select(`
					*,
					media(*),
					user(*),
					review:user_review(*)
				`)
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
				.returns<UserActivity[]>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserActivityQuery = ({
	userId,
	mediaId,
} : {
	userId?: string;
	mediaId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.activity({
			userId: userId as string,
			mediaId: mediaId,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_activity')
				.select('*, review:user_review(*)')
				.match({
					'user_id': userId,
					'media_id': mediaId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!mediaId,
	});
};

export const useUserFollowersRating = ({
	userId,
	mediaId,
} : {
	userId?: string;
	mediaId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.followersRating({
			userId: userId as string,
			mediaId: mediaId,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_followers_rating')
				.select(`
					*,
					user(*)
				`)
				.eq('media_id', mediaId)
				.not('rating', 'is', null)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!mediaId,
	});
}
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const useUserReviewQuery = ({
	reviewId,
	initialData,
} : {
	reviewId: number;
	initialData?: UserReview;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.review({ reviewId: reviewId as number }),
		queryFn: async () => {
			if (!reviewId) throw Error('Missing review id');
			const { data, error } = await supabase
				.from('user_review')
				.select('*, activity:user_activity(*, media(*), user(*))')
				.eq('id', reviewId)
				.returns<UserReview[]>()
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		initialData: initialData,
		enabled: !!reviewId,
	});
};

export const useUserReviewLikeQuery = ({
	userId,
	reviewId,
} : {
	userId?: string;
	reviewId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.reviewLike({
			userId: userId as string,
			reviewId: reviewId as number,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_review_like')
				.select('*')
				.match({
					'user_id': userId,
					'review_id': reviewId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!reviewId,
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
		order?: 'created_at-desc' | 'created_at-asc' | 'random';
		limit?: number;
	};
}) => {
	const mergedFilters = {
		order: 'created_at-asc',
		...filters
	} as typeof filters;
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recos({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from(mergedFilters?.order === 'random' ? 'user_recos_aggregated_random' : 'user_recos_aggregated')
				.select(`
					*,
					media(*)
				`)
				.match({
					'user_id': userId,
					'status': 'active',
				})
			if (mergedFilters) {
				if (mergedFilters?.order !== 'random' && mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					request = request.order(column, { ascending: direction === 'asc', nullsFirst: false });
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request
				.returns<UserRecosAggregated[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	})
};

export const useUserRecosSendQuery = ({
	userId,
	mediaId,
} : {
	userId?: string;
	mediaId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.recosSend({
			mediaId: mediaId,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_friend')
				.select(`
					id,
					friend:friend_id!inner(
						*,
						user_activity(count),
						user_recos!user_recos_user_id_fkey(count)
					)
				`)
				.match({
					'user_id': userId,
					'friend.user_activity.media_id': mediaId,
					'friend.user_recos.media_id': mediaId,
					'friend.user_recos.sender_id': userId,
					'friend.user_recos.status': 'active',
				})
				.returns<(UserFriend & {
					friend: {
						user_activity: {
							count: number;
						}[];
						user_recos: {
							count: number;
						}[];
					};
				})[]>();
			if (error) throw error;
			const output = data?.map((userFriend) => ({
				friend: userFriend.friend,
				as_watched: userFriend.friend.user_activity[0]?.count > 0,
				already_sent: userFriend.friend.user_recos[0]?.count > 0,
			}));
			return output;
		},
		enabled: !!userId && !!mediaId,
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
		order?: 'created_at-desc' | 'created_at-asc' | 'random';
		limit?: number;
	};
}) => {
	const mergedFilters = {
		order: 'created_at-asc',
		...filters
	} as typeof filters;
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlist({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = mergedFilters?.order === 'random'
				? supabase.from('user_watchlist_random').select('*, media(*)').match({ 'user_id': userId, 'status': 'active' })
				: supabase.from('user_watchlist').select('*, media(*)').match({ 'user_id': userId, 'status': 'active' });
			
			if (mergedFilters) {
				if (mergedFilters?.order !== 'random' && mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					request = request.order(column, { ascending: direction === 'asc', nullsFirst: false });
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request
				.returns<UserWatchlist[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

export const useUserWatchlistItemQuery = ({
	userId,
	mediaId,
} : {
	userId?: string;
	mediaId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.watchlistItem({
			userId: userId as string,
			mediaId: mediaId,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user_watchlist')
				.select(`*`)
				.match({
					'user_id': userId,
					'media_id': mediaId,
					'status': 'active',
				})
				.returns<UserWatchlist[]>()
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId && !!mediaId,
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- LIKES --------------------------------- */
export const useUserLikesQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		order?: 'created_at-desc' | 'created_at-asc' | 'random';
		limit?: number;
	};
}) => {
	const mergedFilters = {
		order: 'created_at-asc',
		...filters
	} as typeof filters;
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.likes({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let request = supabase
				.from('user_activity')
				.select(`
					*,
					media(*)
				`)
				.match({
					'user_id': userId,
					'is_liked': true,
				})
			
			if (mergedFilters) {
				if (mergedFilters?.order !== 'random' && mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					request = request.order(column, { ascending: direction === 'asc', nullsFirst: false });
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request
				.returns<UserActivity[]>();
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
		resultsPerPage?: number;
		order?:
			'created_at-desc'
			| 'created_at-asc'
			| 'watched_date-desc'
			| 'watched_date-asc'
			| 'updated_at-desc'
			| 'updated_at-asc';
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		order: 'updated_at-desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.feed({
			userId: userId as string,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
	  		let to = from - 1 + mergedFilters.resultsPerPage;
			let request = supabase
				.from('user_feed')
				.select(`
					*,
					media(*),
					user(*),
					review:user_review(*)
				`)
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					request = request.order(column, { ascending: direction === 'asc', nullsFirst: false });
				}
			}
			const { data, error } = await request
				.returns<UserActivity[]>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
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
		resultsPerPage?: number;
		order?: 'release_date-desc';
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		order: 'release_date-desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.feedCastCrew(userId as string, mergedFilters),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
	  		let to = from - 1 + mergedFilters.resultsPerPage;
			let request = supabase
				.from('user_feed_cast_crew')
				.select(`
					*,
					media:media_movie(title,avatar_url,extra_data,url,date),
					person:media_person(title,avatar_url,url)
				`)
				.range(from, to);
			
			if (mergedFilters) {
				if (mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					switch (column) {
						case 'release_date':
							request = request
								.order('media(date)', { ascending: direction === 'asc', nullsFirst: false });
							break;
					}
				}
			}
			const { data, error } = await request
				.returns<UserFeedCastCrew[]>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
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
				.select(`*, user(*)`)
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
			return lastPage?.length == mergedFilters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserPlaylistsSavedInfiniteQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters?: {
		resultsPerPage?: number;
		sortBy?: 'created_at' | 'updated_at';
		sortOrder?: 'asc' | 'desc';
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		sortBy: 'updated_at',
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
				.select(`*, playlist:playlists(*, user(*))`)
				.eq('user_id', userId)
				.range(from, to)

			if (mergedFilters) {
				if (mergedFilters.sortBy) {
					switch (mergedFilters.sortBy) {
						case 'created_at':
							request = request.order('created_at', { referencedTable: 'playlist', ascending: mergedFilters.sortOrder === 'asc', nullsFirst: false });
							break;
						case 'updated_at':
							request = request.order('updated_at', { referencedTable: 'playlist', ascending: mergedFilters.sortOrder === 'asc', nullsFirst: false });
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
			return lastPage?.length == mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
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
					user(*)
				`)
				.range(from, to)
				.returns<Playlist[]>();
			
			if (mergedFilters) {
				if (mergedFilters.order) {
					const [ column, direction ] = mergedFilters.order.split('-');
					request = request.order(column, { ascending: direction === 'asc', nullsFirst: false });
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserAddMediaToPlaylistQuery = ({
	mediaId,
	userId,
	type = 'personal',
} : {
	mediaId: number;
	userId?: string;
	type: PlaylistType;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: userKeys.addMediaToPlaylist({
			userId: userId as string	,
			mediaId: mediaId,
			type: type,
		}),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			if (!type) throw Error('Missing type');
			if (type === 'personal') { // personal
				const { data, error } = await supabase
					.from('playlists')
					.select('*, playlist_items(count)')
					.match({
						'user_id': userId,
						'playlist_items.media_id': mediaId,
					})
					.order('updated_at', { ascending: false })
				if (error) throw error;
				const output = data?.map(({ playlist_items, ...playlist }) => ({
					playlist: playlist,
					already_added: playlist_items[0]?.count > 0,
				}));
				return output;
			} else { // saved
				const { data, error } = await supabase
					.from('playlists_saved')
					.select(`
						id,
						playlist:playlists!inner(
							*,
							playlist_guests!inner(*),
							user!inner(*),
							playlist_items(count)
						)
					`)
					.match({
						'user_id': userId,
						'playlist.playlist_guests.user_id': userId,
						'playlist.playlist_guests.edit': true,
						'playlist.user.premium': true,
						'playlist.playlist_items.media_id': mediaId,
					})
					.order('updated_at', {
						referencedTable: 'playlist',
						ascending: false 
					})
				if (error) throw error;
				const output = data?.map(({ playlist: { playlist_items, playlist_guests, user, ...playlist }, ...playlists_saved }) => ({
					playlist: playlist,
					already_added: playlist_items[0]?.count > 0,
				}));
				return output;
			}
		},
		enabled: !!userId && !!mediaId,
	});
};

/* -------------------------------------------------------------------------- */

/* -------------------------------- FOLLOWER -------------------------------- */

/**
 * Fetches the user followers
 * @param userId The user id
 * @param filters The filters
 * @param numPerPage The number of items per page
 * @returns The user followers
*/
export const useUserFollowersInfiniteQuery = ({
	userId,
	filters,
	numPerPage = 20,
} : {
	userId?: string;
	filters?: {
		search?: string | null;
	};
	numPerPage?: number;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.followers(userId as string, filters),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * numPerPage;
			let to = from - 1 + numPerPage;

			let query = supabase
				.from('user_follower')
				.select('id, follower:user_id!inner(*)')
				.eq('followee_id', userId)
				.eq('is_pending', false)
				.range(from, to);
			
			if (filters) {
				if (filters.search) {
					query = query
						.ilike(`follower.username`, `${filters.search}%`)
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (data, pages) => {
			return data?.length == numPerPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

/**
 * Fetches the user followers requests
 * @param userId The user id
 * @returns The user followers requests
*/
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
				.select('id, user:user_id!inner(*)')
				.eq('followee_id', userId)
				.eq('is_pending', true)
				.returns<UserFollower[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

/**
 * Fetches the user followees
 * @param userId The user id
 * @param filters The filters
 * @param numPerPage The number of items per page
 * @returns The user followees
*/
export const useUserFolloweesInfiniteQuery = ({
	userId,
	filters,
	numPerPage = 20,
} : {
	userId?: string;
	filters?: {
		search?: string | null;
	};
	numPerPage?: number;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: userKeys.followees(userId as string, { ...filters, infinite: true }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!userId) throw Error('Missing user id');
			let from = (pageParam - 1) * numPerPage;
			let to = from - 1 + numPerPage;

			let query = supabase
				.from('user_follower')
				.select('id, followee:followee_id!inner(*)')
				.eq('user_id', userId)
				.eq('is_pending', false)
				.range(from, to)
			
			if (filters) {
				if (filters.search) {
					query = query
						.ilike(`followee.username`, `${filters.search}%`)
				}
			}
			const { data, error } = await query
				.returns<UserFollower[]>();
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (data, pages) => {
			return data?.length == numPerPage ? pages.length + 1 : undefined;
		},
		enabled: !!userId,
	});
};

export const useUserFolloweesQuery = ({
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
		queryKey: userKeys.followees(userId as string, filters),
		queryFn: async () => {
			if (!userId) throw Error('Missing user id');
			let query = supabase
				.from('user_follower')
				.select('id, followee:followee_id!inner(*)')
				.eq('user_id', userId)
				.eq('is_pending', false);
			
			if (filters) {
				if (filters.search) {
					query = query
						.ilike(`followee.username`, `${filters.search}%`)
				}
			}
			const { data, error } = await query
				.returns<UserFollower[]>();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
	});
};

/* -------------------------------------------------------------------------- */

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
				.from('user')
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
			return lastPage?.length == mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
	});
}

export const useUserFollowProfile = ({
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
}