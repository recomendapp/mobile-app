import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, Playlist, PlaylistItemMovie, PlaylistItemTvSeries } from "@recomendapp/types";
import { useAuth } from "@/providers/AuthProvider";
import { clamp } from "lodash";
import { playlistDetailsOptions, playlistGuestsOptions, playlistItemsMovieOptions, playlistItemsTvSeriesOptions, playlistMovieAddToOptions, playlistTvSeriesAddToOptions } from "./playlistOptions";
import { playlistKeys } from "./playlistKeys";
import { mediasKeys } from "../medias/mediaKeys";
import { randomUUID } from "expo-crypto";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { ImagePickerAsset } from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { userKeys } from "../users/userKeys";

/**
 * Creates a new playlist
 * @param userId The user id
 * @returns The mutation
 */
export const usePlaylistInsertMutation = () => {
	const { session } = useAuth();
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			title,
			type,
			description,
			private: isPrivate,
			poster,
		} : Pick<Database['public']['Tables']['playlists']['Insert'], 'title' | 'type' | 'description' | 'private'> & { poster?: ImagePickerAsset | null }) => {
			if (!session) throw Error('User not authenticated');

			let poster_url: string | null | undefined = poster === null ? null : undefined;
			const { data, error } = await supabase
				.from('playlists')
				.insert({
					title,
					type,
					description,
					private: isPrivate,
					poster_url,
					user_id: session.user.id,
				})
				.select('*, user:profile(*)')
				.single();
			if (error) throw error;
			
			if (poster) {
				const fileExt = poster.uri.split('.').pop();
				const filePath = `${data.id}.${randomUUID()}.${fileExt}`;
				const processedImage = await ImageManipulator.manipulate(poster.uri)
					.resize({ width: 1024, height: 1024 })
					.renderAsync()
				const processedImageCompressed = await processedImage.saveAsync({
					compress: 0.8,
					format: SaveFormat.JPEG,
					base64: true,
				})
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('playlist_posters')
					.upload(filePath, decode(processedImageCompressed.base64!), {
						contentType: `image/${SaveFormat.JPEG}`,
						upsert: true
					});
				if (uploadError) throw uploadError;
				if (!uploadData) throw new Error('No data returned from upload');
				const { data: { publicUrl } } = supabase.storage
					.from('playlist_posters')
					.getPublicUrl(uploadData.path);
				poster_url = publicUrl;

				const { error: updateError } = await supabase
					.from('playlists')
					.update({ poster_url })
					.eq('id', data.id);
				if (updateError) throw updateError;
			}

			return {
				...data,
				poster_url: poster_url ?? data.poster_url,
			}
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
			id,
			title,
			description,
			private: isPrivate,
			poster,
		} : Partial<Pick<Database['public']['Tables']['playlists']['Row'], 'title' | 'description' | 'private'> & { poster: ImagePickerAsset | null }> & { id: number }) => {
			let poster_url: string | null | undefined = poster === null ? null : undefined;
			if (poster) {
				const fileExt = poster.uri.split('.').pop();
				const filePath = `${id}.${randomUUID()}.${fileExt}`;
				const processedImage = await ImageManipulator.manipulate(poster.uri)
					.resize({ width: 1024, height: 1024 })
					.renderAsync()
				const processedImageCompressed = await processedImage.saveAsync({
					compress: 0.8,
					format: SaveFormat.JPEG,
					base64: true,
				})
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('playlist_posters')
					.upload(filePath, decode(processedImageCompressed.base64!), {
						contentType: `image/${SaveFormat.JPEG}`,
						upsert: true
					});
				if (uploadError) throw uploadError;
				if (!uploadData) throw new Error('No data returned from upload');
				const { data: { publicUrl } } = supabase.storage
					.from('playlist_posters')
					.getPublicUrl(uploadData.path);
				poster_url = publicUrl;
			}
			const { data, error } = await supabase
				.from('playlists')
				.update({
					title,
					description,
					private: isPrivate,
					poster_url,
				})
				.eq('id', id)
				.select(`*`)
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(playlistDetailsOptions({ supabase, playlistId: data.id }).queryKey, (oldData) => {
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
		} : {
			playlistId: number;
		}) => {
			const { data, error } = await supabase
				.from('playlists')
				.delete()
				.eq('id', playlistId)
				.select('id')
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(playlistKeys.details({ playlistId: data.id }), null);
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
								return page.filter(playlist => playlist.id !== data.id);
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
	const playlistItemsOptions = playlistItemsMovieOptions({
		supabase,
		playlistId: playlistId,
	});
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
			const cacheData = queryClient.getQueryData(playlistItemsOptions.queryKey);
			if (!cacheData) throw new Error('No cache data found');
			const newPlaylistItems = [...cacheData];
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
			newPlaylistItems && queryClient.setQueryData(playlistItemsOptions.queryKey, newPlaylistItems);
		},
		onError: (error) => {
			queryClient.invalidateQueries({
				queryKey: playlistItemsOptions.queryKey,
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
	const playlistItemsOptions = playlistItemsTvSeriesOptions({
		supabase,
		playlistId: playlistId,
	});
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
			const cacheData = queryClient.getQueryData(playlistItemsOptions.queryKey);
			if (!cacheData) throw new Error('No cache data found');
			const newPlaylistItems = [...cacheData];
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
			newPlaylistItems && queryClient.setQueryData(playlistItemsOptions.queryKey, newPlaylistItems);
		},
		onError: (error) => {
			queryClient.invalidateQueries({
				queryKey: playlistItemsOptions.queryKey,
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
				queryKey: mediasKeys.playlists({
					id: movieId,
					type: 'movie',
				}),
			});

			// Update add to queries
			queryClient.setQueryData(playlistMovieAddToOptions({
				supabase,
				movieId: movieId,
				userId: session?.user.id,
				source: 'personal',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (data.find(p => p.id === item.playlist.id)) {
						return {
							...item,
							already_added: true,
						};
					}
					return item;
				});
			});
			queryClient.setQueryData(playlistMovieAddToOptions({
				supabase,
				movieId: movieId,
				userId: session?.user.id,
				source: 'saved',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (data.find(p => p.id === item.playlist.id)) {
						return {
							...item,
							already_added: true,
						};
					}
					return item;
				});
			});

			// Update each playlists
			data.forEach((playlist) => {
				queryClient.setQueryData(playlistDetailsOptions({ supabase, playlistId: playlist.id }).queryKey, (oldData) => {
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
			// Update add to queries
			queryClient.setQueryData(playlistMovieAddToOptions({
				supabase,
				movieId: data.movie_id,
				userId: session?.user.id,
				source: 'personal',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.playlist.id === data.playlist_id) {
						return {
							...item,
							already_added: false,
						};
					}
					return item;
				});
			});
			queryClient.setQueryData(playlistMovieAddToOptions({
				supabase,
				movieId: data.movie_id,
				userId: session?.user.id,
				source: 'saved',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.playlist.id === data.playlist_id) {
						return {
							...item,
							already_added: false,
						};
					}
					return item;
				});
			});

			// Invalidate media playlists
			queryClient.invalidateQueries({
				queryKey: mediasKeys.playlists({
					id: data.movie_id,
					type: 'movie',
				}),
			});

			// Update playlist
			queryClient.setQueryData(playlistDetailsOptions({ supabase, playlistId: data.playlist_id }).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					items_count: clamp((oldData.items_count ?? 0) - 1, 0, Infinity),
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
			const { error } = await supabase
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
				queryKey: mediasKeys.playlists({
					id: tvSeriesId,
					type: 'tv_series',
				}),
			});

			// Update add to queries
			queryClient.setQueryData(playlistTvSeriesAddToOptions({
				supabase,
				tvSeriesId: tvSeriesId,
				userId: session?.user.id,
				source: 'personal',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (data.find(p => p.id === item.playlist.id)) {
						return {
							...item,
							already_added: true,
						};
					}
					return item;
				});
			});
			queryClient.setQueryData(playlistTvSeriesAddToOptions({
				supabase,
				tvSeriesId: tvSeriesId,
				userId: session?.user.id,
				source: 'saved',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (data.find(p => p.id === item.playlist.id)) {
						return {
							...item,
							already_added: true,
						};
					}
					return item;
				});
			});

			// Update each playlists
			data.forEach((playlist) => {
				queryClient.setQueryData(playlistDetailsOptions({ supabase, playlistId: playlist.id }).queryKey, (oldData) => {
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
			// Update add to queries
			queryClient.setQueryData(playlistTvSeriesAddToOptions({
				supabase,
				tvSeriesId: data.tv_series_id,
				userId: session?.user.id,
				source: 'personal',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.playlist.id === data.playlist_id) {
						return {
							...item,
							already_added: false,
						};
					}
					return item;
				});
			});
			queryClient.setQueryData(playlistTvSeriesAddToOptions({
				supabase,
				tvSeriesId: data.tv_series_id,
				userId: session?.user.id,
				source: 'saved',
			}).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((item) => {
					if (item.playlist.id === data.playlist_id) {
						return {
							...item,
							already_added: false,
						};
					}
					return item;
				});
			});

			// Invalidate media playlists
			queryClient.invalidateQueries({
				queryKey: mediasKeys.playlists({
					id: data.tv_series_id,
					type: 'tv_series',
				}),
			});

			// Update playlist
			queryClient.setQueryData(playlistDetailsOptions({ supabase, playlistId: data.playlist_id }).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					items_count: clamp((oldData.items_count ?? 0) - 1, 0, Infinity),
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

/* --------------------------------- GUESTS --------------------------------- */
export const usePlaylistGuestsUpsertMutation = ({
	playlistId
} : {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			guests,
		} : {
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
					user:profile(*)
				`)
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(playlistGuestsOptions({ supabase, playlistId }).queryKey, (oldData) => {
				if (!oldData) return data;
				return [...oldData.filter(g => !data.some(d => d.user_id === g.user_id)), ...data];
			});
		}
	});
};
export const usePlaylistGuestsDeleteMutation = ({
	playlistId
} : {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			userIds,
		} : {
			userIds: string[];
		}) => {
			const { error } = await supabase
				.from('playlist_guests')
				.delete()
				.eq('playlist_id', playlistId)
				.in('user_id', userIds)
			if (error) throw error;
			return { userIds }
		},
		onSuccess: ({ userIds }) => {
			queryClient.setQueryData(playlistGuestsOptions({ supabase, playlistId }).queryKey, (oldData) => {
				if (!oldData) return oldData;
				return oldData.filter((guest) => !userIds.includes(guest.user_id));
			});
		}
	});
};
/* -------------------------------------------------------------------------- */