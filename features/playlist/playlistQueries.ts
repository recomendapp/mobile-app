import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { playlistKeys } from "./playlistKeys";
import { Playlist, PlaylistGuest, PlaylistItem } from "@/types/type.db";
import { useSupabaseClient } from "@/context/SupabaseProvider";
import { useAuth } from "@/context/AuthProvider";

export const usePlaylistFull = (playlistId: number) => {
	const queryClient = useQueryClient();
	const supabase = useSupabaseClient();
	const { user } = useAuth();
	return useQuery({
		queryKey: playlistKeys.detail(playlistId),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlists')
				.select(`
					*,
					user(*),
					items:playlist_items(*, media(*)),
					guests:playlist_guests(
						*,
						user:user(*)
					)
				`)
				.eq('id', playlistId)
				.order('rank', { ascending: true, referencedTable: 'playlist_items' })
				.returns<Playlist[]>()
				.single();
			if (error || !data) throw error;
			
			// Set the playlist items and guests in the queryClient
			queryClient.setQueryData(playlistKeys.items(playlistId), data.items);
			queryClient.setQueryData(playlistKeys.guests(playlistId), data.guests);
			// queryClient.setQueryData(playlistKeys.allowedToEdit(playlistId), Boolean(
			// 	user?.id === data.user_id ||
			// 	(
			// 		data.guests?.some(
			// 			(guest) => guest?.user_id === user?.id && guest?.edit
			// 		) &&
			// 		data.user?.premium
			// 	)
			// ));
			const { items, guests, ...playlistData } = data;
			return playlistData;	
			// return data;
		},
		enabled: !!playlistId,
	});
}

export const usePlaylistItems = (playlistId?: number) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.items(playlistId as number),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_items')
				.select(`*, media(*)`)
				.eq('playlist_id', playlistId)
				.order('rank', { ascending: true })
				.returns<PlaylistItem[]>()
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		structuralSharing: false,
	});
}

export const usePlaylistGuests = (playlistId?: number) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.guests(playlistId as number),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_guests')
				.select(`
					*,
					user:user(*)
				`)
				.eq('playlist_id', playlistId)
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		structuralSharing: false,
	});
}

export const usePlaylistIsAllowedToEdit = (playlistId?: number) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: playlistKeys.allowedToEdit(playlistId as number),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const playlist = queryClient.getQueryData<Playlist>(playlistKeys.detail(playlistId));
			const playlistGuests = queryClient.getQueryData<PlaylistGuest[]>(playlistKeys.guests(playlistId));
			if (!playlist) throw Error('No playlist data');
			return Boolean(
				user?.id === playlist.user_id ||
				(
					playlistGuests?.some(
						(guest) => guest?.user_id === user?.id && guest?.edit
					) &&
					playlist.user?.premium
				)
			);
		},
		enabled: !!playlistId,
	});
}

export const usePlaylistGuestsSearchInfinite = ({
	playlistId,
	filters
} : {
	playlistId?: number;
	filters?: {
		search?: string;
		alreadyAdded?: string[];
		resultsPerPage?: number;
	};
}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: playlistKeys.guestsAdd({ playlistId: playlistId as number, filters: mergedFilters }),
		queryFn: async ({ pageParam = 1 }) => {
			if (!playlistId) throw Error('Missing playlist id');
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
			let to = from - 1 + mergedFilters.resultsPerPage;
			let query = supabase
				.from('user')
				.select('*')
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.search) {
					query = query
						.or(`username.ilike.${mergedFilters.search}%,full_name.ilike.${mergedFilters.search}%`)
						// .ilike('username', `%${mergedFilters.search}%`)
				}
				if (mergedFilters.alreadyAdded) {
					query = query
						.not('id', 'in', `(${mergedFilters.alreadyAdded.join(',')})`)
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
		throwOnError: true,
		enabled: !!playlistId,
	});
}

/* -------------------------------- FEATURED -------------------------------- */
export const usePlaylistFeaturedInfiniteQuery = ({
	filters
} : {
	filters?: {
		sortBy?: 'created_at' | 'updated_at';
		sortOrder?: 'asc' | 'desc';
		resultsPerPage?: number;
	};
} = {}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		sortBy: 'updated_at',
		sortOrder: 'desc',
		...filters,
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: playlistKeys.featured({ filters: mergedFilters }),
		queryFn: async ({ pageParam = 1 }) => {
			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
			let to = from - 1 + mergedFilters.resultsPerPage;
			let query = supabase
				.from('playlists_featured')
				.select('*, playlist:playlists(*, user(*))')
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy) {
					switch (mergedFilters.sortBy) {
						case 'created_at':
							query = query.order('created_at', { referencedTable: 'playlist', ascending: mergedFilters.sortOrder === 'asc', nullsFirst: false });
							break;
						case 'updated_at':
							query = query.order('updated_at', { referencedTable: 'playlist', ascending: mergedFilters.sortOrder === 'asc', nullsFirst: false });
							break;
						default:
							break;
					}
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
		},
		throwOnError: true,
	});
}
/* -------------------------------------------------------------------------- */

