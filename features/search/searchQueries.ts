import { useSupabaseClient } from "@/context/SupabaseProvider";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchKeys } from "./searchKeys";
import { useTranslation } from "react-i18next";

export const useSearchPlaylistsInfiniteQuery = ({
	query,
	filters,
} : {
	query: string;
	filters?: {
		sortBy?: 'updated_at';
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
	const { i18n } = useTranslation();
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: searchKeys.playlists({
			locale: i18n.language,
			query: query,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			let from  = (pageParam - 1) * mergedFilters.perPage;
			let to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.from('playlists')
				.select('*, user(*)')
				.range(from, to)
				.ilike('title', `%${query}%`)
			if (mergedFilters) {
				if (mergedFilters.sortBy && mergedFilters.sortOrder) {
					switch (mergedFilters.sortBy) {
						case 'updated_at':
							request = request.order('updated_at', { ascending: mergedFilters.sortOrder === 'asc' });
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
		enabled: !!query,
	})
};