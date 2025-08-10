
import { User, UserActivity, UserFollower, UserRecosAggregated, UserWatchlist } from '@/types/type.db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from './userKeys';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useAuth } from '@/providers/AuthProvider';
import { mediaKeys } from '../media/mediaKeys';

export const useUserUpdateMutation = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			fullName,
			username,
			avatar,
			bio,
			website,
			avatarUrl,
			privateAccount,
			language,
		} : {
			fullName?: string;
			username?: string;
			avatar?: string | null;
			bio?: string | null;
			website?: string | null;
			avatarUrl?: string | null;
			privateAccount?: boolean;
			language?: string;
		}) => {
			if (!userId) throw Error('Missing user id');
			const { data, error } = await supabase
				.from('user')
				.update({
					full_name: fullName,
					username: username,
					avatar: avatar,
					bio: bio,
					website: website,
					avatar_url: avatarUrl,
					private: privateAccount,
					language: language,
				})
				.eq('id', userId)
				.select('*')
				.single();
				if (error) throw error;
				return data;
			},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.detail(data.id), data);
			queryClient.setQueryData(userKeys.profile(data.username), (oldData: User | undefined) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					...data,
				}
			});
		}
	});
};

/**
 * Accepts a follower request
 * @returns The mutation
 */
export const useUserAcceptFollowerRequestMutation = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			requestId,
		} : {
			requestId: number;
		}) => {
			const { error } = await supabase
				.from('user_follower')
				.update({
					is_pending: false,
				})
				.eq('id', requestId)
			if (error) throw error;
			return requestId;
		},
		onSuccess: (requestId) => {
			// Delete the request from the cache
			queryClient.setQueryData(userKeys.followersRequests(userId as string), (oldData: UserFollower[] | undefined) => {
				if (!oldData) return [];
				return oldData.filter((request) => request.id !== requestId);
			});
			// Invalidate the followees cache
			queryClient.invalidateQueries({queryKey: userKeys.followees(userId as string)});
		},
	});
};

/**
 * Declines a follower request
 * @returns The mutation
 */
export const useUserDeclineFollowerRequestMutation = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			requestId,
		} : {
			requestId: number;
		}) => {
			const { error } = await supabase
				.from('user_follower')
				.delete()
				.eq('id', requestId)
			if (error) throw error;
			return requestId;
		},
		onSuccess: (requestId) => {
			// Delete the request from the cache
			queryClient.setQueryData(userKeys.followersRequests(userId as string), (oldData: UserFollower[] | undefined) => {
				if (!oldData) return [];
				return oldData.filter((request) => request.id !== requestId);
			});
		},
	});
};

export const useUserFollowProfileInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			followeeId,
		} : {
			userId?: string;
			followeeId?: string;
		}) => {
			if (!userId || !followeeId) throw Error('Missing user id or followee id');
			const { data, error } = await supabase
				.from('user_follower')
				.insert({
					user_id: userId,
					followee_id: followeeId,
				})
				.select('*, followee:followee_id(*)')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.followProfile(data.user_id, data.followee_id), data);
			!data.is_pending && queryClient.setQueryData(userKeys.followees(data.user_id), (oldData: { pages: UserFollower[][] } | undefined) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => [...page, data]),
				}
			});
		},
	});
};

export const useUserFollowProfileDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			followeeId,
		} : {
			userId?: string;
			followeeId?: string;
		}) => {
			if (!userId || !followeeId) throw Error('Missing user id or followee id');
			const { data, error } = await supabase
				.from('user_follower')
				.delete()
				.eq('user_id', userId)
				.eq('followee_id', followeeId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.followProfile(data.user_id, data.followee_id), null);
			!data.is_pending && queryClient.setQueryData(userKeys.followees(data.user_id), (oldData: { pages: UserFollower[][] } | undefined) => {
				if (!oldData) return oldData;
				return {
				...oldData,
				pages: oldData.pages.map((page) =>
					page.filter((item) => item.id !== data.id)
				),
				};
			});
		},
	});
};


/* -------------------------------- ACTIVITY -------------------------------- */
export const useUserActivityInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			mediaId,
			rating,
			isLiked,
		} : {
			userId: string;
			mediaId: number;
			rating?: number;
			isLiked?: boolean;
		}) => {
			const { data, error } = await supabase
				.from('user_activity')
				.insert({
					user_id: userId,
					media_id: mediaId,
					rating: rating,
					is_liked: isLiked,
				})
				.select(`*, review:user_review(*)`)
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.activity({
				userId: data.user_id,
				mediaId: data.media_id,
			}), data);

			// Remove media from watchlist
			queryClient.setQueryData(userKeys.watchlistItem({
				userId: data.user_id,
				mediaId: data.media_id,
			}), null);

			// TODO: Remove media from recommendations
			// queryClient.setQueryData(userKeys.recos({userId: data.user_id}), (oldData: UserRecosAggregated[]) => {
			// 	if (!oldData) return oldData;
			// 	return oldData.filter((reco: any) => !(reco.media_id === data.media_id && reco.media_type === data.media_type));
			// });

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};

export const useUserActivityDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
		} : {
			activityId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_activity')
				.delete()
				.eq('id', activityId)
				.select(`*, review:user_review(*)`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.activity({
				userId: data.user_id,
				mediaId: data.media_id,
			}), null);

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};

export const useUserActivityUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
			rating,
			watchedDate,
			isLiked,
		} : {
			activityId: number;
			rating?: number | null;
			watchedDate?: Date;
			isLiked?: boolean;
		}) => {
			const { data, error } = await supabase
				.from('user_activity')
				.update({
					rating: rating,
					watched_date: watchedDate?.toISOString(),
					is_liked: isLiked,
				})
				.eq('id', activityId)
				.select(`*, review:user_review(*)`)
				.single()
			if (error) throw error;
			return {
				...data,
				isLikedChange: isLiked !== undefined,
			};
		},
		onSuccess: ({ isLikedChange, ...data}) => {
			queryClient.setQueryData(userKeys.activity({
				userId: data.user_id,
				mediaId: data.media_id,
			}), data);

			/* ---------------- Delete the like in all the likes queries ---------------- */
			if (isLikedChange) {
				const baseKey = userKeys.likes({ userId: data.user_id });
				const likesQueries = queryClient.getQueriesData<UserActivity[]>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				likesQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: UserActivity[] | undefined) => {
						if (!currentData) return currentData;
						return currentData.filter(
							(like) => like.id !== data.id
						);
					});
				});
			}
			/* -------------------------------------------------------------------------- */

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEW --------------------------------- */

export const useUserReviewInsertMutation = ({
	userId,
	mediaId,
} : {
	userId?: string;
	mediaId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
			title,
			body,
		} : {
			activityId: number;
			title?: string | null;
			body: any;
		}) => {
			const { data, error } = await supabase
				.from('user_review')
				.insert({
					id: activityId,
					title: title,
					body: body,
				})
				.select('*')
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			// Invalidate reviews queries
			queryClient.invalidateQueries({
				queryKey: mediaKeys.reviews({ id: mediaId }),
			});

			// Invalidate the review activity
			userId && queryClient.invalidateQueries({
				queryKey: userKeys.activity({ userId: userId, mediaId }),
			});
		}
	});
};

export const useUserReviewUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			title,
			body,
		} : {
			id: number;
			title?: string | null;
			body: any;
		}) => {
			const { data, error } = await supabase
				.from('user_review')
				.update({
					title: title,
					body: body,
				})
				.eq('id', id)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			// queryClient.setQueryData(userKeys.review({ reviewId: data.id }), data);
		},
	});
};

// export const useUserReviewDeleteMutation = ({
// 	userId,
// 	mediaId,
// } : {
// 	userId?: string;
// 	mediaId: number;
// }) => {
// 	const supabase = useSupabaseClient();
// 	const queryClient = useQueryClient();
// 	return useMutation({
// 		mutationFn: async ({
// 			id,
// 		} : {
// 			id: number;
// 		}) => {
// 			const { error } = await supabase
// 				.from('user_review')
// 				.delete()
// 				.eq('id', id)
// 			if (error) throw error;
// 			return {
// 				id,
// 				mediaId,
// 			}
// 		},
// 		onSuccess: (data) => {
// 			queryClient.setQueryData(userKeys.review({ reviewId: data.id }), null);

// 			queryClient.invalidateQueries({
// 				queryKey: mediaKeys.reviews({ mediaId: data.mediaId }),
// 			});

// 			// Invalidate the review activity
// 			userId && queryClient.invalidateQueries({
// 				queryKey: userKeys.activity({ userId: userId, mediaId: data.mediaId }),
// 			});
// 		},
// 	});
// }

// Likes
export const useUserReviewLikeInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			reviewId,
		} : {
			userId: string;
			reviewId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_review_like')
				.insert({
					user_id: userId,
					review_id: reviewId,
				})
				.select('*')
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.reviewLike({ userId: data.user_id, reviewId: data.review_id }), data);
		},
	});
};

export const useUserReviewLikeDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			likeId,
		} : {
			likeId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_review_like')
				.delete()
				.eq('id', likeId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.reviewLike({ userId: data.user_id, reviewId: data.review_id }), null);
		},
	});
}
/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
export const useUserRecosInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			senderId,
			mediaId,
			receivers,
			comment,
		} : {
			senderId: string;
			mediaId: number;
			receivers: User[];
			comment: string;
		}) => {
			if (receivers.length === 0) throw Error('Missing receivers');
			const { error } = await supabase
				.rpc('user_recos_insert', {
					mediaid: mediaId,
					receiver_user_ids: receivers.map((user) => String(user?.id)),
					sender_user_id: senderId,
					comment: comment,
				})
			if (error) throw error;
			return {
				senderId,
				mediaId,
			}
		},
		onSuccess: ({ mediaId }) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.recosSend({ mediaId: mediaId }),
			});
		}
	});	
};

export const useUserRecosDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			mediaId,
		} : {
			userId: string;
			mediaId: number;
		}) => {
			const { error } = await supabase
				.from('user_recos')
				.update({
					status: 'deleted',
				})
				.match({
					media_id: mediaId,
					user_id: userId,
					status: 'active',
				})
				if (error) throw error;
				return {
					userId,
					mediaId,
				};
		},
		onSuccess: (data) => {
			/* ---------------- Delete the reco in all the recos queries ---------------- */
			const baseKey = userKeys.recos({ userId: data.userId});
			const recosQueries = queryClient.getQueriesData<UserRecosAggregated[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});
			recosQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserRecosAggregated[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(reco) => reco.media_id !== data.mediaId
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		},
	});
};

export const useUserRecosCompleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			mediaId,
		} : {
			userId: string;
			mediaId: number;
		}) => {
			const { error } = await supabase
				.from('user_recos')
				.update({
					status: 'completed',
				})
				.match({
					media_id: mediaId,
					user_id: userId,
					status: 'active',
				})
				.single();
			if (error) throw error;
			return {
				userId,
				mediaId,
			}
		},
		onSuccess: (data) => {
			/* ---------------- Delete the reco in all the recos queries ---------------- */
			const baseKey = userKeys.recos({ userId: data.userId});
			const recosQueries = queryClient.getQueriesData<UserRecosAggregated[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});
			recosQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserRecosAggregated[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(reco) => reco.media_id !== data.mediaId
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		},
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- WATCHLIST ------------------------------- */
export const useUserWatchlistInsertMutation = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			mediaId,
		} : {
			userId: string;
			mediaId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlist')
				.insert({
					user_id: userId,
					media_id: mediaId,
				})
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				userId: data.user_id,
				mediaId: data.media_id,
			}), data);
		},
		meta: {
			invalidates: [
				userKeys.watchlist({
					userId: userId as string,
				}),
			]
		}
	});
};

export const useUserWatchlistDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			watchlistId,
		} : {
			watchlistId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlist')
				.delete()
				.eq('id', watchlistId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				userId: data.user_id,
				mediaId: data.media_id,
			}), null);
			/* -------------- Delete the item in all the watchlist queries -------------- */
			const baseKey = userKeys.watchlist({ userId: data.user_id});
			const watchlistQueries = queryClient.getQueriesData<UserWatchlist[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			watchlistQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserWatchlist[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(watchlist) => watchlist?.id !== data.id
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		}
	});
};

export const useUserWatchlistUpdateMutation = () => {
	const supabase = useSupabaseClient();
	return useMutation({
		mutationFn: async ({
			watchlistId,
			comment,
		} : {
			watchlistId: number;
			comment: string;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlist')
				.update({
					comment: comment,
				})
				.eq('id', watchlistId)
				.select()
				.single()
			if (error) throw error;
			return data;
		}
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLIST -------------------------------- */
export const useUserPlaylistSavedInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	return useMutation({
		mutationFn: async ({
			playlistId,
		} : {
			playlistId: number;
		}) => {
			if (!user) throw Error('Missing user');
			const { data, error } = await supabase
				.from('playlists_saved')
				.insert({
					user_id: user.id,
					playlist_id: playlistId,
				})
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.playlistSaved({
				userId: data.user_id,
				playlistId: data.playlist_id,
			}), data);

			queryClient.invalidateQueries({
				queryKey: userKeys.playlistsSaved({
					userId: data.user_id,
				})
			})
		}
	});
};

export const useUserPlaylistSavedDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			savedId,
		} : {
			savedId: number;
		}) => {
			const { data, error } = await supabase
				.from('playlists_saved')
				.delete()
				.eq('id', savedId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.playlistSaved({
				userId: data.user_id,
				playlistId: data.playlist_id,
			}), null);

			queryClient.invalidateQueries({
				queryKey: userKeys.playlistsSaved({
					userId: data.user_id,
				})
			})
		}
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- ACCOUNT -------------------------------- */
export const useUserDeleteRequestInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
		} : {
			userId: string;
		}) => {
			const { data, error } = await supabase
				.from('user_deletion_requests')
				.insert({
					user_id: userId,
				})
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.deleteRequest({ userId: data.user_id }), data);
		}
	});
};

export const useUserDeleteRequestDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
		} : {
			userId: string;
		}) => {
			const { data, error } = await supabase
				.from('user_deletion_requests')
				.delete()
				.eq('user_id', userId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.deleteRequest({ userId: data.user_id }), null);
		}
	});
};
/* -------------------------------------------------------------------------- */
