import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { mediaKeys } from "./mediaKeys";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Media, MediaMovie } from "@/types/type.db";

/* --------------------------------- DETAILS -------------------------------- */
export const useMediaDetailsQuery = ({
	id,
} : {
	id: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id }),
		queryFn: async () => {
			if (!id) throw Error('No id provided');
			const { data, error } = await supabase
				.from('media')
				.select(`
					*
				`)
				.match({
					media_id: id,
				})
				.maybeSingle()
				.overrideTypes<Media, { merge: false }>();
			if (error) throw error;
			return data;
		},
		enabled: !!id,
	});
};

export const useMediaMovieDetailsQuery = ({
	id,
	locale,
} : {
	id?: number | null;
	locale: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: mediaKeys.detail({ id: id as number, type: 'movie' }),
		queryFn: async () => {
			if (!id) throw Error('No id or type provided');
			const { data, error } = await supabase
				.from('media_movie')
				.select(`
					*,
					cast:tmdb_movie_credits(
						id,
						person:media_person(*),
						role:tmdb_movie_roles(*)
					),
					videos:tmdb_movie_videos(*)	
				`)
				.match({
					'id': id,
					'cast.job': 'Actor',
					'videos.iso_639_1': locale.split('-')[0],
					'videos.type': 'Trailer',
				})
				.order('published_at', { referencedTable: 'videos', ascending: true, nullsFirst: false })
				.returns<MediaMovie[]>()
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!id && !!locale,
	});
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const useMediaReviewsInfiniteQuery = ({
	id,
	filters,
} : {
	id?: number | null;
	filters: {
		perPage: number;
		sortBy: 'updated_at';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: mediaKeys.reviews({
			id: id!,
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!id) throw Error('No id provided');
			let from = (pageParam - 1) * filters.perPage;
	  		let to = from - 1 + filters.perPage;
			let request = supabase
				.from('user_review')
				.select(`
					*,
					activity:user_activity!inner(*, user(*))
				`)
				.eq('activity.media_id', id)
				.range(from, to)
			
			if (filters) {
				if (filters.sortBy && filters.sortOrder) {
					switch (filters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: filters.sortOrder === 'asc' });
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
			return lastPage?.length == filters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!id,
	});

};
/* -------------------------------------------------------------------------- */
export const useMediaPlaylistsInfiniteQuery = ({
	id,
	filters,
} : {
	id?: number | null;
	filters: {
		perPage: number;
		sortBy: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: mediaKeys.playlists({
			id: id!,
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!id) throw Error('No id provided');
			let from = (pageParam - 1) * filters.perPage;
	  		let to = from - 1 + filters.perPage;
			let request = supabase
				.from('playlists')
				.select('*, user(*), playlist_items!inner(*)')
				.match({
					'playlist_items.media_id': id,
				})
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
			return lastPage?.length == filters.perPage ? pages.length + 1 : undefined;
		},
		enabled: !!id,
	});
};
/* -------------------------------- PLAYLISTS ------------------------------- */

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   PERSON                                   */
/* -------------------------------------------------------------------------- */

/* ------------------------------- FILMOGRAPHY ------------------------------ */
// export const useMediaPersonMostRatedInfiniteQuery = ({
// 	personId,
// 	filters,
// } : {
// 	personId: number;
// 	filters?: {
// 		resultsPerPage?: number;
// 		limit?: number;
// 	};
// }) => {
// 	const mergedFilters = {
// 		resultsPerPage: 20,
// 		limit: 10,
// 		...filters,
// 	};
// 	const supabase = useSupabaseClient();
// 	return useInfiniteQuery({
// 		queryKey: mediaKeys.mostRated({ personId, filters: mergedFilters }),
// 		queryFn: async ({ pageParam = 1}) => {
// 			if (!personId) throw Error('No person id provided');
// 			let from = (pageParam - 1) * mergedFilters.resultsPerPage;
// 			let to = from - 1 + mergedFilters.resultsPerPage;
// 			let request = supabase
// 				.from('media_person_combined_credits')
// 				.select('*')
// 				.eq('person_id', personId)
// 				.order('popularity', { ascending: false, nullsFirst: false })
// 				.order('tmdb_popularity', { ascending: false, nullsFirst: false })
// 				.range(from, to);
// 			if (mergedFilters) {
// 				if (mergedFilters.limit) {
// 					request = request.limit(mergedFilters.limit);
// 				}
// 			}
// 			const { data, error } = await request;
// 			if (error) throw error;
// 			return data;
// 		},
// 		initialPageParam: 1,
// 		getNextPageParam: (lastPage, pages) => {
// 			return lastPage?.length == mergedFilters.resultsPerPage ? pages.length + 1 : undefined;
// 		},
// 		enabled: !!personId,
// 	});
// };
/* -------------------------------------------------------------------------- */