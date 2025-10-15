
import { JSONContent, Profile, User, UserActivityMovie, UserActivityTvSeries, UserFollower, UserRecosAggregated, UserRecosMovieAggregated, UserRecosTvSeriesAggregated, UserReviewMovie, UserReviewTvSeries, UserWatchlist, UserWatchlistMovie, UserWatchlistTvSeries } from '@recomendapp/types';
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
			queryClient.setQueryData(userKeys.session(), data);
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

export const useUserFollowPersonInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			personId,
		} : {
			userId: string;
			personId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_person_follower')
				.insert({
					person_id: personId,
					user_id: userId,
				})
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.followPerson(data.user_id, data.person_id), data);
			queryClient.invalidateQueries({
				queryKey: userKeys.feedCastCrew({ userId: data.user_id })
			})
		},
	});
};

export const useUserFollowPersonDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			personId,
		} : {
			userId: string;
			personId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_person_follower')
				.delete()
				.eq('user_id', userId)
				.eq('person_id', personId)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.followPerson(data.user_id, data.person_id), null);
			queryClient.invalidateQueries({
				queryKey: userKeys.feedCastCrew({ userId: data.user_id })
			})
		},
	});
};

/* -------------------------------- ACTIVITY -------------------------------- */
// Movies
export const useUserActivityMovieInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			movieId,
			rating,
			isLiked,
		} : {
			userId: string;
			movieId: number;
			rating?: number;
			isLiked?: boolean;
		}) => {
			const { data, error } = await supabase
				.from('user_activities_movie')
				.insert({
					user_id: userId,
					movie_id: movieId,
					rating: rating,
					is_liked: isLiked,
				})
				.select(`*, review:user_reviews_movie(*)`)
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.activity({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), data);

			// Watchlist
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), null);

			// Heart picks
			if (data.is_liked) {
				queryClient.invalidateQueries({
					queryKey: userKeys.heartPicks({
						userId: data.user_id,
						type: 'movie',
					})
				});
			}

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
export const useUserActivityMovieDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
		} : {
			activityId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_activities_movie')
				.delete()
				.eq('id', activityId)
				.select(`*, review:user_reviews_movie(*)`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.activity({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), null);

			// Heart picks
			if (data.is_liked) {
				queryClient.setQueryData(userKeys.heartPicks({
					userId: data.user_id,
					type: 'movie',
				}), (oldData: UserActivityMovie[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.filter((pick) => pick.id !== data.id);
				});
			}

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};
export const useUserActivityMovieUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
			rating,
			isLiked,
			watchedDate,
		} : {
			activityId: number;
			rating?: number | null;
			isLiked?: boolean;
			watchedDate?: Date;
		}) => {
			const { data, error } = await supabase
				.from('user_activities_movie')
				.update({
					rating: rating,
					is_liked: isLiked,
					watched_date: watchedDate?.toISOString(),
				})
				.eq('id', activityId)
				.select(`*, review:user_reviews_movie(*)`)
				.single()
			if (error) throw error;
			return {
				...data,
				isLikedChange: isLiked,
			};
		},
		onSuccess: ({ isLikedChange, ...data}) => {
			queryClient.setQueryData(userKeys.activity({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), data);

			// Heart picks
			if (isLikedChange !== undefined) {
				if (isLikedChange) {
					queryClient.invalidateQueries({
						queryKey: userKeys.heartPicks({
							userId: data.user_id,
							type: 'movie',
						})
					})
				} else {
					// Remove from heart pick
					queryClient.setQueryData(userKeys.heartPicks({
						userId: data.user_id,
						type: 'movie',
					}), (oldData: UserActivityMovie[] | undefined) => {
						if (!oldData) return oldData;
						return oldData.filter((pick) => pick.id !== data.id);
					});
				}
			}

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};

// TV Series
export const useUserActivityTvSeriesInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			tvSeriesId,
			rating,
			isLiked,
		} : {
			userId: string;
			tvSeriesId: number;
			rating?: number;
			isLiked?: boolean;
		}) => {
			const { data, error } = await supabase
				.from('user_activities_tv_series')
				.insert({
					user_id: userId,
					tv_series_id: tvSeriesId,
					rating: rating,
					is_liked: isLiked,
				})
				.select(`*, review:user_reviews_tv_series(*)`)
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.activity({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), data);

			// Watchlist
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), null);

			// Heart picks
			if (data.is_liked) {
				queryClient.invalidateQueries({
					queryKey: userKeys.heartPicks({
						userId: data.user_id,
						type: 'tv_series',
					})
				});
			}

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
export const useUserActivityTvSeriesDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
		} : {
			activityId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_activities_tv_series')
				.delete()
				.eq('id', activityId)
				.select(`*, review:user_reviews_tv_series(*)`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.activity({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), null);

			// Heart picks
			if (data.is_liked) {
				queryClient.setQueryData(userKeys.heartPicks({
					userId: data.user_id,
					type: 'tv_series',
				}), (oldData: UserActivityTvSeries[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.filter((pick) => pick.id !== data.id);
				});
			}

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};
export const useUserActivityTvSeriesUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
			rating,
			isLiked,
			watchedDate,
		} : {
			activityId: number;
			rating?: number | null;
			isLiked?: boolean;
			watchedDate?: Date;
		}) => {
			const { data, error } = await supabase
				.from('user_activities_tv_series')
				.update({
					rating: rating,
					is_liked: isLiked,
					watched_date: watchedDate?.toISOString(),
				})
				.eq('id', activityId)
				.select(`*, review:user_reviews_tv_series(*)`)
				.single()
			if (error) throw error;
			return {
				...data,
				isLikedChange: isLiked,
			};
		},
		onSuccess: ({ isLikedChange, ...data}) => {
			queryClient.setQueryData(userKeys.activity({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), data);

			// Heart picks
			if (isLikedChange !== undefined) {
				if (isLikedChange) {
					queryClient.invalidateQueries({
						queryKey: userKeys.heartPicks({
							userId: data.user_id,
							type: 'tv_series',
						})
					});
				} else {
					queryClient.setQueryData(userKeys.heartPicks({
						userId: data.user_id,
						type: 'tv_series',
					}), (oldData: UserActivityTvSeries[] | undefined) => {
						if (!oldData) return oldData;
						return oldData.filter((pick) => pick.id !== data.id);
					});
				}
			}

			queryClient.invalidateQueries({
				queryKey: userKeys.feed({ userId: data.user_id })
			})
		}
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEW --------------------------------- */
// Movies
export const useUserReviewMovieUpsertMutation = ({
	userId,
	movieId
}: {
	userId?: string;
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
			title,
			body,
		} : {
			activityId?: number;
			title?: string | null;
			body: JSONContent;
		}) => {
			const { data, error } = await supabase
				.from('user_reviews_movie')
				.upsert({
					id: activityId,
					title: title,
					body: body,
				}, { onConflict: 'id'})
				.select('*')
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			const oldReview = queryClient.getQueryData<UserReviewMovie | null | undefined>(userKeys.review({ id: data.id, type: 'movie' }));
			if (oldReview === null) {
				queryClient.removeQueries({
					queryKey: userKeys.review({ id: data.id, type: 'movie' }),
				});
			} else if (oldReview) {
				queryClient.setQueryData(userKeys.review({ id: data.id, type: 'movie' }), (oldData: UserReviewMovie) => {
					return {
						...oldData,
						...data,
					};
				});
			}

			// Invalidate reviews queries
			movieId && queryClient.invalidateQueries({
				queryKey: mediaKeys.reviews({ id: movieId, type: 'movie' }),
			});

			// Invalidate the review activity
			movieId && userId && queryClient.setQueryData(userKeys.activity({ id: movieId, type: 'movie', userId: userId }), (oldData: UserActivityMovie | null): UserActivityMovie | null => {
				if (!oldData) return oldData;
				return {
					...oldData,
					review: {
						...oldData.review,
						...data,
					},
				};
			});
		}
	});
};
export const useUserReviewMovieDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			id,
			movieId,
		} : {
			id: number;
			movieId: number;
		}) => {
			const { error } = await supabase
				.from('user_reviews_movie')
				.delete()
				.eq('id', id)
			if (error) throw error;
			return {
				id,
				movieId,
			}
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.review({ id: data.id, type: 'movie' }), null);

			data.movieId && queryClient.invalidateQueries({
				queryKey: mediaKeys.reviews({ id: data.movieId, type: 'movie' }),
			});

			// Invalidate the review activity
			session?.user.id && queryClient.setQueryData(userKeys.activity({ id: data.movieId, type: 'movie', userId: session.user.id }), (oldData: UserActivityMovie | null): UserActivityMovie | null => {
				if (!oldData) return oldData;
				return {
					...oldData,
					review: null,
				};
			});
		}
	});
};

export const useUserReviewMovieLikeInsertMutation = () => {
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
				.from('user_review_movie_likes')
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
			queryClient.setQueryData(userKeys.reviewLike({ reviewId: data.review_id, type: 'movie', userId: data.user_id }), data);
		},
	});
};
export const useUserReviewMovieLikeDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			likeId,
		} : {
			likeId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_review_movie_likes')
				.delete()
				.eq('id', likeId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.reviewLike({ reviewId: data.review_id, type: 'movie', userId: data.user_id }), null);
		},
	});
};

// Tv Series
export const useUserReviewTvSeriesUpsertMutation = ({
	userId,
	tvSeriesId
}: {
	userId?: string;
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			activityId,
			title,
			body,
		} : {
			activityId?: number;
			title?: string | null;
			body: JSONContent;
		}) => {
			const { data, error } = await supabase
				.from('user_reviews_tv_series')
				.upsert({
					id: activityId,
					title: title,
					body: body,
				}, { onConflict: 'id'})
				.select('*')
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			const oldReview = queryClient.getQueryData<UserReviewTvSeries | null | undefined>(userKeys.review({ id: data.id, type: 'tv_series' }));
			if (oldReview === null) {
				queryClient.removeQueries({
					queryKey: userKeys.review({ id: data.id, type: 'tv_series' }),
				});
			} else if (oldReview) {
				queryClient.setQueryData(userKeys.review({ id: data.id, type: 'tv_series' }), (oldData: UserReviewTvSeries) => {
					return {
						...oldData,
						...data,
					};
				});
			}

			// Invalidate reviews queries
			tvSeriesId && queryClient.invalidateQueries({
				queryKey: mediaKeys.reviews({ id: tvSeriesId, type: 'tv_series' }),
			});

			// Invalidate the review activity
			tvSeriesId && userId && queryClient.setQueryData(userKeys.activity({ id: tvSeriesId, type: 'tv_series', userId: userId }), (oldData: UserActivityTvSeries | null): UserActivityTvSeries | null => {
				if (!oldData) return oldData;
				return {
					...oldData,
					review: {
						...oldData.review,
						...data,
					},
				};
			});
		}
	});
};
export const useUserReviewTvSeriesDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			id,
			tvSeriesId
		} : {
			id: number;
			tvSeriesId: number;
		}) => {
			const { error } = await supabase
				.from('user_reviews_tv_series')
				.delete()
				.eq('id', id)
			if (error) throw error;
			return {
				id,
				tvSeriesId,
			}
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.review({ id: data.id, type: 'tv_series' }), null);

			data.tvSeriesId && queryClient.invalidateQueries({
				queryKey: mediaKeys.reviews({ id: data.tvSeriesId, type: 'tv_series' }),
			});

			// Invalidate the review activity
			session?.user.id && queryClient.setQueryData(userKeys.activity({ id: data.tvSeriesId, type: 'tv_series', userId: session.user.id }), (oldData: UserActivityTvSeries | null): UserActivityTvSeries | null => {
				if (!oldData) return oldData;
				return {
					...oldData,
					review: null,
				};
			});
		}
	});
};

export const useUserReviewTvSeriesLikeInsertMutation = () => {
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
				.from('user_review_tv_series_likes')
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
			queryClient.setQueryData(userKeys.reviewLike({ reviewId: data.review_id, type: 'tv_series', userId: data.user_id }), data);
		},
	});
};
export const useUserReviewTvSeriesLikeDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			likeId,
		} : {
			likeId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_review_tv_series_likes')
				.delete()
				.eq('id', likeId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.reviewLike({ reviewId: data.review_id, type: 'tv_series', userId: data.user_id }), null);
		},
	});
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
// Movies
export const useUserRecosMovieInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			senderId,
			movieId,
			receivers,
			comment,
		} : {
			senderId: string;
			movieId: number;
			receivers: Profile[];
			comment?: string;
		}) => {
			if (receivers.length === 0) throw Error('Missing receivers');
			const { error } = await supabase
				.rpc('user_recos_movie_insert', {
					p_movie_id: movieId,
					receiver_user_ids: receivers.map((user) => String(user?.id)),
					sender_user_id: senderId,
					comment: comment,
				})
			if (error) throw error;
			return {
				senderId,
				movieId,
			}
		},
		onSuccess: ({ movieId }) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.recosSend({ id: movieId, type: 'movie' }),
			});
		}
	});
};
export const useUserRecosMovieDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			movieId,
			userId,
		} : {
			movieId: number;
			userId: string;
		}) => {
			const { error } = await supabase
				.from('user_recos_movie')
				.update({
					status: 'deleted',
				})
				.match({
					movie_id: movieId,
					user_id: userId,
					status: 'active',
				})
			if (error) throw error;
			return {
				movieId,
				userId,
			};
		},
		onSuccess: (data) => {
			/* -------------- Delete the item in all the my recos queries -------------- */
			const baseKey = userKeys.recos({ userId: data.userId, type: 'movie' });
			const recosQueries = queryClient.getQueriesData<UserRecosMovieAggregated[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			recosQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserRecosMovieAggregated[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(reco) => reco.movie_id !== data.movieId
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		}
	});
};
export const useUserRecosMovieCompleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			movieId,
			userId,
		} : {
			movieId: number;
			userId: string;
		}) => {
			const { error } = await supabase
				.from('user_recos_movie')
				.update({
					status: 'completed',
				})
				.match({
					movie_id: movieId,
					user_id: userId,
					status: 'active',
				})
				.single();
			if (error) throw error;
			return {
				movieId,
				userId,
			}
		},
		onSuccess: (data) => {
			/* -------------- Delete the item in all the my recos queries -------------- */
			const baseKey = userKeys.recos({ userId: data.userId, type: 'movie' });
			const recosQueries = queryClient.getQueriesData<UserRecosMovieAggregated[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			recosQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserRecosMovieAggregated[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(reco) => reco.movie_id !== data.movieId
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		}
	});
};

// TV Series
export const useUserRecosTvSeriesInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			senderId,
			tvSeriesId,
			receivers,
			comment,
		} : {
			senderId: string;
			tvSeriesId: number;
			receivers: Profile[];
			comment?: string;
		}) => {
			if (receivers.length === 0) throw Error('Missing receivers');
			const { error } = await supabase
				.rpc('user_recos_tv_series_insert', {
					p_tv_series_id: tvSeriesId,
					receiver_user_ids: receivers.map((user) => String(user?.id)),
					sender_user_id: senderId,
					comment: comment,
				})
			if (error) throw error;
			return {
				senderId,
				tvSeriesId,
			}
		},
		onSuccess: ({ tvSeriesId }) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.recosSend({ id: tvSeriesId, type: 'tv_series' }),
			});
		}
	});
};
export const useUserRecosTvSeriesDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			tvSeriesId,
			userId,
		} : {
			tvSeriesId: number;
			userId: string;
		}) => {
			const { error } = await supabase
				.from('user_recos_tv_series')
				.update({
					status: 'deleted',
				})
				.match({
					tv_series_id: tvSeriesId,
					user_id: userId,
					status: 'active',
				})
			if (error) throw error;
			return {
				tvSeriesId,
				userId,
			};
		},
		onSuccess: (data) => {
			/* -------------- Delete the item in all the my recos queries -------------- */
			const baseKey = userKeys.recos({ userId: data.userId, type: 'tv_series' });
			const recosQueries = queryClient.getQueriesData<UserRecosTvSeriesAggregated[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			recosQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserRecosTvSeriesAggregated[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(reco) => reco.tv_series_id !== data.tvSeriesId
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		}
	});
};
export const useUserRecosTvSeriesCompleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			tvSeriesId,
			userId,
		} : {
			tvSeriesId: number;
			userId: string;
		}) => {
			const { error } = await supabase
				.from('user_recos_tv_series')
				.update({
					status: 'completed',
				})
				.match({
					tv_series_id: tvSeriesId,
					user_id: userId,
					status: 'active',
				})
				.single();
			if (error) throw error;
			return {
				tvSeriesId,
				userId,
			}
		},
		onSuccess: (data) => {
			/* -------------- Delete the item in all the my recos queries -------------- */
			const baseKey = userKeys.recos({ userId: data.userId, type: 'tv_series' });
			const recosQueries = queryClient.getQueriesData<UserRecosTvSeriesAggregated[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			recosQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserRecosTvSeriesAggregated[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(reco) => reco.tv_series_id !== data.tvSeriesId
					);
				});
			});
			/* -------------------------------------------------------------------------- */
		}
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- WATCHLIST ------------------------------- */
// Movies
export const useUserWatchlistMovieInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			movieId,
		} : {
			userId: string;
			movieId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlists_movie')
				.insert({
					user_id: userId,
					movie_id: movieId,
				})
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), data);

			queryClient.invalidateQueries({
				queryKey: userKeys.watchlist({
					userId: data.user_id,
					type: 'movie',
				})
			});
		}
	});
};
export const useUserWatchlistMovieDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			watchlistId,
		} : {
			watchlistId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlists_movie')
				.delete()
				.eq('id', watchlistId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), null);

			/* -------------- Delete the item in all the watchlist queries -------------- */
			const baseKey = userKeys.watchlist({ userId: data.user_id, type: 'movie' });
			const watchlistQueries = queryClient.getQueriesData<UserWatchlistMovie[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			watchlistQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserWatchlistMovie[] | undefined) => {
					if (!currentData) return currentData;
					return currentData.filter(
						(watchlist) => watchlist?.id !== data.id
					);
				});
			});
			// /* -------------------------------------------------------------------------- */
		}
	});
};
export const useUserWatchlistMovieUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			watchlistId,
			comment,
		} : {
			watchlistId: number;
			comment: string;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlists_movie')
				.update({
					comment: comment,
				})
				.eq('id', watchlistId)
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.movie_id,
				type: 'movie',
				userId: data.user_id,
			}), data);


			// Watchlist
			// All
			queryClient.setQueryData(userKeys.watchlist({
				userId: data.user_id,
				type: 'all',
			}), (oldData: UserWatchlist[]) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.type === 'movie' && item.id === data.id) {
						return {
							...item,
							...data,
						};
					}
					return item;
				});
			});
			// Movies
			queryClient.setQueryData(userKeys.watchlist({
				userId: data.user_id,
				type: 'movie',
			}), (oldData: UserWatchlistMovie[]) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.id === data.id) {
						return {
							...item,
							...data,
						};
					}
					return item;
				});
			});
		}
	});
};

// TV Series
export const useUserWatchlistTvSeriesInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			tvSeriesId,
		} : {
			userId: string;
			tvSeriesId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlists_tv_series')
				.insert({
					user_id: userId,
					tv_series_id: tvSeriesId,
				})
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), data);

			queryClient.invalidateQueries({
				queryKey: userKeys.watchlist({
					userId: data.user_id,
					type: 'tv_series',
				})
			});
		}
	});
};
export const useUserWatchlistTvSeriesDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			watchlistId,
		} : {
			watchlistId: number;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlists_tv_series')
				.delete()
				.eq('id', watchlistId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), null);

			/* -------------- Delete the item in all the watchlist queries -------------- */
			const baseKey = userKeys.watchlist({ userId: data.user_id, type: 'tv_series' });
			const watchlistQueries = queryClient.getQueriesData<UserWatchlistTvSeries[]>({
				predicate: (query) => {
					const key = query.queryKey
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				}
			});

			watchlistQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: UserWatchlistTvSeries[] | undefined) => {
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
export const useUserWatchlistTvSeriesUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			watchlistId,
			comment,
		} : {
			watchlistId: number;
			comment: string;
		}) => {
			const { data, error } = await supabase
				.from('user_watchlists_tv_series')
				.update({
					comment: comment,
				})
				.eq('id', watchlistId)
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.watchlistItem({
				id: data.tv_series_id,
				type: 'tv_series',
				userId: data.user_id,
			}), data);

			// Watchlist
			// All
			queryClient.setQueryData(userKeys.watchlist({
				userId: data.user_id,
				type: 'all',
			}), (oldData: UserWatchlist[]) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.type === 'tv_series' && item.id === data.id) {
						return {
							...item,
							...data,
						};
					}
					return item;
				});
			});
			// Movies
			queryClient.setQueryData(userKeys.watchlist({
				userId: data.user_id,
				type: 'tv_series',
			}), (oldData: UserWatchlistTvSeries[]) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.id === data.id) {
						return {
							...item,
							...data,
						};
					}
					return item;
				});
			});
		}
	});
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLIST -------------------------------- */
// Likes
export const useUserPlaylistLikeInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			playlistId,
		} : {
			userId: string;
			playlistId: number;
		}) => {
			const { data, error } = await supabase
				.from('playlists_likes')
				.insert({
					user_id: userId,
					playlist_id: playlistId,
				})
				.select()
				.single()
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.playlistLike({
				userId: data.user_id,
				playlistId: data.playlist_id,
			}), data);
		}
	});
};

export const useUserPlaylistLikeDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			likeId,
		} : {
			likeId: number;
		}) => {
			const { data, error } = await supabase
				.from('playlists_likes')
				.delete()
				.eq('id', likeId)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(userKeys.playlistLike({
				userId: data.user_id,
				playlistId: data.playlist_id,
			}), null);
		}
	});
};

// Saved
export const useUserPlaylistSavedInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			playlistId,
		} : {
			userId: string;
			playlistId: number;
		}) => {
			if (!userId) throw Error('Missing user');
			const { data, error } = await supabase
				.from('playlists_saved')
				.insert({
					user_id: userId,
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
