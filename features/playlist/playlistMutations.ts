import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { userKeys } from "../user/userKeys";
import { InfiniteData, matchQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Playlist, PlaylistGuest, PlaylistItemMovie, PlaylistItemTvSeries, PlaylistType } from "@recomendapp/types";
import { playlistKeys } from "./playlistKeys";
import { mediaKeys } from "../media/mediaKeys";
import { useAuth } from "@/providers/AuthProvider";
import { clamp } from "lodash";

/**
 * Creates a new playlist
 * @param userId The user id
 * @returns The mutation
 */
export const usePlaylistInsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			title,
			type,
			userId,
			description,
			private: isPrivate,
			poster_url,
		} : {
			title: string;
			type: PlaylistType;
			userId: string;
			description?: string | null;
			private?: boolean;
			poster_url?: string | null;
		}) => {
			if (!userId) throw Error('User id is missing');
			const { data, error } = await supabase
				.from('playlists')
				.insert({
					title,
					type,
					description,
					private: isPrivate,
					poster_url,
					user_id: userId,
				})
				.select(`*`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.playlists({
					userId: data.user_id
				}),
			});
		}
	});
};

/**
 * Updates a playlist
 * @returns The mutation
 */
export const usePlaylistUpdateMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			playlistId,
			title,
			description,
			private: isPrivate,
			poster_url,
		} : {
			playlistId: number;
			title?: string;
			description?: string | null;
			private?: boolean;
			poster_url?: string | null;
		}) => {
			const { data, error } = await supabase
				.from('playlists')
				.update({
					title,
					description,
					private: isPrivate,
					poster_url,
				})
				.eq('id', playlistId)
				.select(`*`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(playlistKeys.detail(data.id), (oldData: Playlist | undefined) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					...data,
				};
			});

			// Update playlists users
			if (session) {
				const baseKey = userKeys.playlists({ userId: session?.user.id });
				const playlistsQueries = queryClient.getQueriesData<InfiniteData<Playlist[] | undefined>>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				playlistsQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: InfiniteData<Playlist[] | undefined>) => {
						if (!currentData) return currentData;
						return {
							...currentData,
							pages: currentData.pages.map(page => {
								if (!page) return page;
								return page?.map(playlist => {
									if (playlist.id === data.id) {
										return {
											...playlist,
											...data,
										}
									}
									return playlist;
								});
							})
						};
					});
				});
			}
		}
	});
};

/**
 * Deletes a playlist
 * @param userId The user id
 * @returns The mutation
 */
export const usePlaylistDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			playlistId,
			userId,
		} : {
			playlistId: number;
			userId: string;
		}) => {
			if (!userId) throw Error('User id is missing');
			const { error } = await supabase
				.from('playlists')
				.delete()
				.eq('id', playlistId)
			if (error) throw error;
			return {
				playlistId,
				userId,
			};
		},
		onSuccess: ({ playlistId }) => {
			// Update playlists users
			if (session) {
				const baseKey = userKeys.playlists({ userId: session?.user.id });
				const playlistsQueries = queryClient.getQueriesData<InfiniteData<Playlist[] | undefined>>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				playlistsQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: InfiniteData<Playlist[] | undefined>) => {
						if (!currentData) return currentData;
						return {
							...currentData,
							pages: currentData.pages.map(page => {
								if (!page) return page;
								return page.filter(playlist => playlist.id !== playlistId);
							})
						};
					});
				});
			}
		}
	});
};

// Realtime
export const usePlaylistItemsMovieRealtimeMutation = ({
	playlistId
} : {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			event,
			payload,
		} : {
			event: string;
			payload: {
				old: PlaylistItemMovie;
				new: PlaylistItemMovie;
			}
		}) => {
			const newPlaylistItems = [...queryClient.getQueryData<PlaylistItemMovie[]>(playlistKeys.items(playlistId)) || []];
			if (!newPlaylistItems.length) throw new Error('playlist items is undefined');
			switch (event) {
				case 'INSERT':
					if (payload.new.playlist_id !== playlistId) throw new Error('Invalid playlist id');
					const { error: insertError, data: insertData } = await supabase
						.from('playlist_items_movie')
						.select(`*, movie:media_movie(*)`)
						.eq('id', payload.new.id)
						.single();
					if (insertError) throw insertError;
					newPlaylistItems.forEach(item => {
						if (item.rank >= payload.new.rank) {
							item.rank++;
						}
					});
					newPlaylistItems.push({
						...payload.new,
						movie: insertData.movie
					});
					break;
				case 'UPDATE':
					if (!payload.new.playlist_id) throw new Error('Invalid playlist id');
					const itemIndex = newPlaylistItems.findIndex((item) => item.id === payload.new.id);
					if (itemIndex === -1) throw new Error('Missing item');

					if (payload.old.rank !== payload.new.rank) {
						if (payload.old.rank < payload.new.rank) {
							newPlaylistItems.forEach(item => {
							if (item.rank > payload.old.rank && item.rank <= payload.new.rank) {
								item.rank--;
							}
							});
						}
						if (payload.old.rank > payload.new.rank) {
							newPlaylistItems.forEach(item => {
							if (item.rank < payload.old.rank && item.rank >= payload.new.rank) {
								item.rank++;
							}
							});
						}
					}
					newPlaylistItems[itemIndex] = {
						...newPlaylistItems[itemIndex],
						...payload.new
					};
					break;
				case 'DELETE':
					if (!payload.old.playlist_id) throw new Error('Invalid playlist id');
					const deleteIndex = newPlaylistItems.findIndex((item) => item.id === payload.old.id);
					if (deleteIndex === -1) throw new Error('Missing item');
					newPlaylistItems.splice(deleteIndex, 1);

					newPlaylistItems.forEach(item => {
						if (item.rank > payload.old.rank) {
							item.rank--;
						}
					});
					break;
				default:
					break;
			};
			newPlaylistItems.sort((a, b) => a.rank - b.rank);
			return newPlaylistItems;
		},
		onSuccess: (newPlaylistItems) => {
			newPlaylistItems && queryClient.setQueryData(playlistKeys.items(playlistId), newPlaylistItems);
		},
		onError: (error) => {
			queryClient.invalidateQueries({
				queryKey: playlistKeys.items(playlistId),
			});
		}
	});
};
export const usePlaylistItemsTvSeriesRealtimeMutation = ({
	playlistId
} : {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			event,
			payload,
		} : {
			event: string;
			payload: {
				old: PlaylistItemTvSeries;
				new: PlaylistItemTvSeries;
			}
		}) => {
			const newPlaylistItems = [...queryClient.getQueryData<PlaylistItemTvSeries[]>(playlistKeys.items(playlistId)) || []];
			if (!newPlaylistItems.length) throw new Error('playlist items is undefined');
			switch (event) {
				case 'INSERT':
					if (payload.new.playlist_id !== playlistId) throw new Error('Invalid playlist id');
					const { error: insertError, data: insertData } = await supabase
						.from('playlist_items_tv_series')
						.select(`*, tv_series:media_tv_series(*)`)
						.eq('id', payload.new.id)
						.single();
					if (insertError) throw insertError;
					newPlaylistItems.forEach(item => {
						if (item.rank >= payload.new.rank) {
							item.rank++;
						}
					});
					newPlaylistItems.push({
						...payload.new,
						tv_series: insertData.tv_series
					});
					break;
				case 'UPDATE':
					if (!payload.new.playlist_id) throw new Error('Invalid playlist id');
					const itemIndex = newPlaylistItems.findIndex((item) => item.id === payload.new.id);
					if (itemIndex === -1) throw new Error('Missing item');

					if (payload.old.rank !== payload.new.rank) {
						if (payload.old.rank < payload.new.rank) {
							newPlaylistItems.forEach(item => {
							if (item.rank > payload.old.rank && item.rank <= payload.new.rank) {
								item.rank--;
							}
							});
						}
						if (payload.old.rank > payload.new.rank) {
							newPlaylistItems.forEach(item => {
							if (item.rank < payload.old.rank && item.rank >= payload.new.rank) {
								item.rank++;
							}
							});
						}
					}
					newPlaylistItems[itemIndex] = {
						...newPlaylistItems[itemIndex],
						...payload.new
					};
					break;
				case 'DELETE':
					if (!payload.old.playlist_id) throw new Error('Invalid playlist id');
					const deleteIndex = newPlaylistItems.findIndex((item) => item.id === payload.old.id);
					if (deleteIndex === -1) throw new Error('Missing item');
					newPlaylistItems.splice(deleteIndex, 1);

					newPlaylistItems.forEach(item => {
						if (item.rank > payload.old.rank) {
							item.rank--;
						}
					});
					break;
				default:
					break;
			};
			newPlaylistItems.sort((a, b) => a.rank - b.rank);
			return newPlaylistItems;
		},
		onSuccess: (newPlaylistItems) => {
			newPlaylistItems && queryClient.setQueryData(playlistKeys.items(playlistId), newPlaylistItems);
		},
		onError: (error) => {
			queryClient.invalidateQueries({
				queryKey: playlistKeys.items(playlistId),
			});
		}
	});
};


/* ---------------------------------- ITEMS --------------------------------- */
// Movie
export const usePlaylistMovieInsertMutation = ({
	movieId
} : {
	movieId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			playlists,
			movieId,
			userId,
			comment,
		} : {
			playlists: Playlist[];
			movieId: number;
			userId: string;
			comment?: string | null;
		}) => {
			if (!userId) throw Error('User id is missing');
			if (playlists.length === 0) throw Error('You must select at least one playlist');
			const { error } = await supabase
				.from('playlist_items_movie')
				.insert(
					playlists.map((playlist) => ({
						playlist_id: playlist.id,
						movie_id: movieId,
						user_id: userId,
						comment: comment,
						rank: 0,
					}))
				);
			if (error) throw error;
			return playlists;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: mediaKeys.playlists({
					id: movieId,
					type: 'movie',
				}),
			});
			// Update each playlists
			data.forEach((playlist) => {
				queryClient.setQueryData(playlistKeys.detail(playlist.id), (oldData: Playlist) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						items_count: (oldData.items_count ?? 0) + 1,
					};
				});
			});
			// Update playlists users
			if (session) {
				const baseKey = userKeys.playlists({ userId: session?.user.id });
				const playlistsQueries = queryClient.getQueriesData<InfiniteData<Playlist[] | undefined>>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				playlistsQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: InfiniteData<Playlist[] | undefined>) => {
						if (!currentData) return currentData;
						return {
							...currentData,
							pages: currentData.pages.map(page => {
								if (!page) return page;
								return page?.map(playlist => {
									if (playlist.id === data.find(p => p.id === playlist.id)?.id) {
										return {
											...playlist,
											items_count: (playlist.items_count ?? 0) + 1,
										}
									}
									return playlist;
								});
							})
						};
					});
				});
			}
		},
		meta: {
			invalidates: [
				playlistKeys.addTo({ id: movieId, type: 'movie' }),
			]
		}
	});
};
export const usePlaylistMovieDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			itemId,
		} : {
			itemId: number;
		}) => {
			const { data, error } = await supabase
				.from('playlist_items_movie')
				.delete()
				.eq('id', itemId)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: playlistKeys.addTo({ id: data.id, type: 'movie' }),
			});
			queryClient.invalidateQueries({
				queryKey: mediaKeys.playlists({
					id: data.movie_id,
					type: 'movie',
				}),
			});
			// Update playlist
			queryClient.setQueryData(playlistKeys.detail(data.playlist_id), (data: Playlist) => {
				if (!data) return null;
				return {
					...data,
					items_count: clamp(data.items_count - 1, 0, Infinity),
				};
			});
			// Update user playlists
			if (session) {
				const baseKey = userKeys.playlists({ userId: session?.user.id });
				const playlistsQueries = queryClient.getQueriesData<InfiniteData<Playlist[] | undefined>>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				playlistsQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: InfiniteData<Playlist[] | undefined>) => {
						if (!currentData) return currentData;
						return {
							...currentData,
							pages: currentData.pages.map(page => {
								if (!page) return page;
								return page?.map(playlist => {
									if (playlist.id === data.playlist_id) {
										return {
											...playlist,
											items_count: clamp((playlist.items_count ?? 0) - 1, 0, Infinity),
										}
									}
									return playlist;
								});
							})
						};
					});
				});
			}
		},
	});
};
export const usePlaylistMovieUpdateMutation = () => {
	const supabase = useSupabaseClient();
	return useMutation({
		mutationFn: async ({
			itemId,
			rank,
			comment,
		} : {
			itemId: number;
			rank?: number;
			comment?: string | null;
		}) => {
			const { data, error } = await supabase
				.from('playlist_items_movie')
				.update({
					rank,
					comment,
				})
				.eq('id', itemId)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
	});
};
// TV Series
export const usePlaylistTvSeriesInsertMutation = ({
	tvSeriesId
} : {
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			playlists,
			tvSeriesId,
			userId,
			comment,
		} : {
			playlists: Playlist[];
			tvSeriesId: number;
			userId: string;
			comment?: string | null;
		}) => {
			if (!userId) throw Error('User id is missing');
			if (playlists.length === 0) throw Error('You must select at least one playlist');
			const { data, error } = await supabase
				.from('playlist_items_tv_series')
				.insert(
					playlists.map((playlist) => ({
						playlist_id: playlist.id,
						tv_series_id: tvSeriesId,
						user_id: userId,
						comment: comment,
						rank: 0,
					}))
				);
			if (error) throw error;
			return playlists;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: mediaKeys.playlists({
					id: tvSeriesId,
					type: 'tv_series',
				}),
			});

			// Update each playlists
			data.forEach((playlist) => {
				queryClient.setQueryData(playlistKeys.detail(playlist.id), (oldData: Playlist) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						items_count: (oldData.items_count ?? 0) + 1,
					};
				});
			});
			// Update playlists users
			if (session) {
				const baseKey = userKeys.playlists({ userId: session?.user.id });
				const playlistsQueries = queryClient.getQueriesData<InfiniteData<Playlist[] | undefined>>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				playlistsQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: InfiniteData<Playlist[] | undefined>) => {
						if (!currentData) return currentData;
						return {
							...currentData,
							pages: currentData.pages.map(page => {
								if (!page) return page;
								return page?.map(playlist => {
									if (playlist.id === data.find(p => p.id === playlist.id)?.id) {
										return {
											...playlist,
											items_count: (playlist.items_count ?? 0) + 1,
										}
									}
									return playlist;
								});
							})
						};
					});
				});
			}
		},
		meta: {
			invalidates: [
				playlistKeys.addTo({ id: tvSeriesId, type: 'tv_series' }),
			]
		}
	});
};
export const usePlaylistTvSeriesDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const { session } = useAuth();
	return useMutation({
		mutationFn: async ({
			itemId,
		} : {
			itemId: number;
		}) => {
			const { data, error } = await supabase
				.from('playlist_items_tv_series')
				.delete()
				.eq('id', itemId)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: playlistKeys.addTo({ id: data.id, type: 'tv_series' }),
			});
			queryClient.invalidateQueries({
				queryKey: mediaKeys.playlists({
					id: data.tv_series_id,
					type: 'tv_series',
				}),
			});
			// Update playlist
			queryClient.setQueryData(playlistKeys.detail(data.playlist_id), (data: Playlist) => {
				if (!data) return null;
				return {
					...data,
					items_count: clamp(data.items_count - 1, 0, Infinity),
				};
			});
			// Update user playlists
			if (session) {
				const baseKey = userKeys.playlists({ userId: session?.user.id });
				const playlistsQueries = queryClient.getQueriesData<InfiniteData<Playlist[] | undefined>>({
					predicate: (query) => {
						const key = query.queryKey
						return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
					}
				});
				playlistsQueries.forEach(([key, oldData]) => {
					if (!oldData) return;
					queryClient.setQueryData(key, (currentData: InfiniteData<Playlist[] | undefined>) => {
						if (!currentData) return currentData;
						return {
							...currentData,
							pages: currentData.pages.map(page => {
								if (!page) return page;
								return page?.map(playlist => {
									if (playlist.id === data.playlist_id) {
										return {
											...playlist,
											items_count: clamp((playlist.items_count ?? 0) - 1, 0, Infinity),
										}
									}
									return playlist;
								});
							})
						};
					});
				});
			}
		},
	});
};
export const usePlaylistTvSeriesUpdateMutation = () => {
	const supabase = useSupabaseClient();
	return useMutation({
		mutationFn: async ({
			itemId,
			rank,
			comment,
		} : {
			itemId: number;
			rank?: number;
			comment?: string | null;
		}) => {
			const { data, error } = await supabase
				.from('playlist_items_tv_series')
				.update({
					rank,
					comment,
				})
				.eq('id', itemId)
				.select('*')
				.single();
			if (error) throw error;
			return data;
		},
	});
};

/* -------------------------------------------------------------------------- */
export const usePlaylistMovieMultiInsertMutation = ({
	playlistId,
} : {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			movieIds,
			comment,
		} : {
			userId: string;
			movieIds: number[];
			comment?: string;
		}) => {
			if (movieIds.length === 0) throw Error('Missing media ids');
			const { data, error } = await supabase
				.from('playlist_items_movie')
				.insert(
					movieIds.map((movieId) => ({
						playlist_id: playlistId,
						movie_id: movieId,
						user_id: userId,
						comment: comment,
						rank: 0,
					}))
				)
				.select('id');
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(playlistKeys.detail(playlistId), (oldData: Playlist) => {
				if (!oldData) return null;
				return {
					...oldData,
					items_count: oldData.items_count + data.length,
				};
			});
		}
	});
};
export const usePlaylistTvSeriesMultiInsertMutation = ({
	playlistId,
} : {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userId,
			tvSeriesIds,
			comment,
		} : {
			userId: string;
			tvSeriesIds: number[];
			comment?: string;
		}) => {
			if (tvSeriesIds.length === 0) throw Error('Missing media ids');
			const { data, error } = await supabase
				.from('playlist_items_tv_series')
				.insert(
					tvSeriesIds.map((tvSeriesId) => ({
						playlist_id: playlistId,
						tv_series_id: tvSeriesId,
						user_id: userId,
						comment: comment,
						rank: 0,
					}))
				)
				.select('id');
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(playlistKeys.detail(playlistId), (oldData: Playlist) => {
				if (!oldData) return null;
				return {
					...oldData,
					items_count: oldData.items_count + data.length,
				};
			});
		}
	});
};

/* --------------------------------- GUESTS --------------------------------- */

export const usePlaylistGuestsUpsertMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			playlistId,
			guests,
		} : {
			playlistId: number;
			guests: { user_id: string; edit?: boolean }[];
		}) => {
			const { data, error } = await supabase
				.from('playlist_guests')
				.upsert(
					guests.map(({ user_id, edit }) => ({
						playlist_id: playlistId,
						user_id,
						edit: edit,
					})), {
						onConflict: "playlist_id, user_id",
						defaultToNull: false,
					}
				)
				.select(`
					*,
					user(*)
				`)
			if (error) throw error;
			return { playlistId, data };
		},
		onSuccess: ({ playlistId, data }) => {
			queryClient.setQueryData(playlistKeys.guests(playlistId), (oldData: PlaylistGuest[]) => {
				return [...oldData.filter(g => !data.some(d => d.user_id === g.user_id)), ...data];
			});
		}
	});
};

export const usePlaylistGuestsDeleteMutation = () => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			ids,
			playlistId,
		} : {
			ids: number[];
			playlistId: number;
		}) => {
			const { error } = await supabase
				.from('playlist_guests')
				.delete()
				.in('id', ids)
			if (error) throw error;
			return { ids, playlistId };
		},
		onSuccess: ({ ids, playlistId }) => {
			queryClient.setQueryData(playlistKeys.guests(playlistId), (data: PlaylistGuest[]) => {
				if (!data) return null;
				return data.filter((guest) => !ids.includes(guest?.id));
			});
		}
	});
};
/* -------------------------------------------------------------------------- */