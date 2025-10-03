import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { searchKeys } from "./searchKeys";
import { useLocale } from "use-intl";
import { searchClient } from "@/lib/search";
import { MovieSearchQuery, PersonSearchQuery, PlaylistSearchQuery, TvSeriesSearchQuery, UserSearchQuery } from "@recomendapp/types";

const PER_PAGE = 10;

export const useSearchMultiQuery = ({
	query,
} : {
	query: string;
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: searchKeys.multi({
			locale: locale,
			query: query,
		}),
		queryFn: async () => {
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchBestResults({
				query: query,
				results_per_type: PER_PAGE,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		enabled: !!query && !!query.length,
	})
};

export const useSearchMoviesInfiniteQuery = ({
	query,
	filters = {
		per_page: PER_PAGE,
		sort_by: 'popularity',
	},
} : {
	query?: string;
	filters?: Omit<MovieSearchQuery, 'query' | 'page'>;
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: searchKeys.movies({
			locale: locale,
			query: query!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchMovies({
				query: query,
				page: pageParam,
				...filters,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.current_page < lastPage.pagination.total_pages
				? lastPage.pagination.current_page + 1
				: undefined;
		},
		enabled: !!query && !!query.length,
	})
};

export const useSearchTvSeriesInfiniteQuery = ({
	query,
	filters = {
		per_page: PER_PAGE,
		sort_by: 'popularity',
	},
} : {
	query?: string;
	filters?: Omit<TvSeriesSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: searchKeys.tv_series({
			locale: locale,
			query: query!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchTvSeries({
				query: query,
				page: pageParam,
				...filters,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.current_page < lastPage.pagination.total_pages
				? lastPage.pagination.current_page + 1
				: undefined;
		},
		enabled: !!query && !!query.length,
	})
};

export const useSearchPersonsInfiniteQuery = ({
	query,
	filters = {
		per_page: PER_PAGE,
		sort_by: 'popularity',
	},
} : {
	query?: string;
	filters?: Omit<PersonSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: searchKeys.persons({
			locale: locale,
			query: query!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchPersons({
				query: query,
				page: pageParam,
				...filters,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.current_page < lastPage.pagination.total_pages
				? lastPage.pagination.current_page + 1
				: undefined;
		},
		enabled: !!query && !!query.length,
	})
};

export const useSearchUsersInfiniteQuery = ({
	query,
	filters = {
		per_page: PER_PAGE,
	},
} : {
	query?: string;
	filters?: Omit<UserSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: searchKeys.users({
			locale: locale,
			query: query!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchUsers({
				query: query,
				page: pageParam,
				...filters,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.current_page < lastPage.pagination.total_pages
				? lastPage.pagination.current_page + 1
				: undefined;
		},
		enabled: !!query && !!query.length,
	})
};

export const useSearchPlaylistsInfiniteQuery = ({
	query,
	filters = {
		per_page: PER_PAGE,
		sort_by: 'likes_count',
	},
} : {
	query?: string;
	filters?: Omit<PlaylistSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: searchKeys.playlists({
			locale: locale,
			query: query!,
			filters: filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchPlaylists({
				query: query,
				page: pageParam,
				...filters,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.current_page < lastPage.pagination.total_pages
				? lastPage.pagination.current_page + 1
				: undefined;
		},
		enabled: !!query && !!query.length,
	})
};