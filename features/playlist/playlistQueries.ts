import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { playlistKeys } from "./playlistKeys";
import { Playlist, PlaylistGuest, PlaylistItem } from "@/types/type.db";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useAuth } from "@/providers/AuthProvider";

export const usePlaylistFullQuery = (playlistId: number) => {
	const supabase = useSupabaseClient();
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
				.maybeSingle();
			if (error) throw error;
			return data;	
		},
		enabled: !!playlistId,
	});
}

export const usePlaylistQuery = ({
	playlistId
}: {
	playlistId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.detail(playlistId),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlists')
				.select(`
					*,
					user(*)
				`)
				.eq('id', playlistId)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
	});
}

export const usePlaylistItemsQuery = ({
	playlistId,
	initialData
}: {
	playlistId?: number,
	initialData?: PlaylistItem[]
}) => {
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
				.overrideTypes<PlaylistItem[], { merge: false }>()
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		initialData: initialData,
	});
}

export const usePlaylistGuestsQuery = ({
	playlistId,
	initialData
}: {
	playlistId?: number,
	initialData?: PlaylistGuest[]
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: playlistKeys.guests(playlistId!),
		queryFn: async () => {
			if (!playlistId) throw Error('Missing playlist id');
			const { data, error } = await supabase
				.from('playlist_guests')
				.select(`
					*,
					user:user(*)
				`)
				.eq('playlist_id', playlistId)
				.overrideTypes<PlaylistGuest[], { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!playlistId,
		initialData: initialData,
	});
}

export const usePlaylistIsAllowedToEditQuery = ({
	playlist,
	guests,
}: {
	playlist?: Playlist;
	guests?: PlaylistGuest[] | null;
}) => {
	const { user } = useAuth();
	return useQuery({
		queryKey: playlistKeys.allowedToEdit(playlist?.id!),
		queryFn: async () => {
			if (!playlist) throw Error('No playlist data');
			return Boolean(
				user?.id === playlist.user_id ||
				(
					guests?.some(
						(guest) => guest?.user_id === user?.id && guest?.edit
					) &&
					playlist.user?.premium
				)
			);
		},
		enabled: !!playlist && guests !== undefined,
	});
}

export const usePlaylistGuestsSearchInfiniteQuery = ({
	playlistId,
	enabled = true,
	filters
} : {
	playlistId?: number;
	enabled?: boolean;
	filters?: {
		search?: string;
		exclude?: string[];
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
				}
				if (mergedFilters.exclude) {
					query = query
						.not('id', 'in', `(${mergedFilters.exclude.join(',')})`)
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
		enabled: !!playlistId && !!mergedFilters.search?.length && !!enabled,
	});
}

/* -------------------------------- FEATURED -------------------------------- */
export const usePlaylistFeaturedInfiniteQuery = ({
	filters
} : {
	filters?: {
		sortBy?: 'created_at';
		sortOrder?: 'asc' | 'desc';
		resultsPerPage?: number;
	};
} = {}) => {
	const mergedFilters = {
		resultsPerPage: 20,
		sortBy: 'created_at',
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
				.select('*, playlist:playlists!inner(*, user(*))')
				.range(from, to)
			
			if (mergedFilters) {
				if (mergedFilters.sortBy) {
					switch (mergedFilters.sortBy) {
						case 'created_at':
							query = query.order('playlist(created_at)', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						case 'updated_at':
							query = query.order('playlist(updated_at)', { ascending: mergedFilters.sortOrder === 'asc' });
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

