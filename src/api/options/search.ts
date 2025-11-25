import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { useLocale } from "use-intl";
import { Keys } from "../keys";
import { searchClient } from "@/lib/search";
import { MovieSearchQuery, PersonSearchQuery, PlaylistSearchQuery, TvSeriesSearchQuery, UserSearchQuery } from "@recomendapp/types";

export const useSearchMultiOptions = ({
	query,
	filters,
} : {
	query: string;
	filters?: {
		perPage?: number;
	}
}) => {
	const mergedFilters = {
		perPage: 10,
		...filters
	}
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: Keys.search.multi({ locale: locale, query: query, filters: filters }),
		queryFn: async () => {
			const token = (await supabase.auth.getSession()).data.session?.access_token;
			return await searchClient.searchBestResults({
				query: query,
				results_per_type: mergedFilters.perPage,
			}, {
				accessToken: token,
				locale: locale,
			});
		},
		enabled: !!query && !!query.length,
	})
};

export const useSearchMoviesOptions = ({
	query,
	filters = {
		per_page: 10,
		sort_by: 'popularity',
	},
} : {
	query?: string;
	filters?: Omit<MovieSearchQuery, 'query' | 'page'>;
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.movies({
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

export const useSearchTvSeriesOptions = ({
	query,
	filters = {
		per_page: 10,
		sort_by: 'popularity',
	},
} : {
	query?: string;
	filters?: Omit<TvSeriesSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.tvSeries({
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

export const useSearchPersonsOptions = ({
	query,
	filters = {
		per_page: 10,
		sort_by: 'popularity',
	},
} : {
	query?: string;
	filters?: Omit<PersonSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.persons({
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

export const useSearchUsersOptions = ({
	query,
	filters = {
		per_page: 10,
	},
} : {
	query?: string;
	filters?: Omit<UserSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.users({
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

export const useSearchPlaylistsOptions = ({
	query,
	filters = {
		per_page: 10,
		sort_by: 'likes_count',
	},
} : {
	query?: string;
	filters?: Omit<PlaylistSearchQuery, 'query' | 'page'>
}) => {
	const locale = useLocale();
	const supabase = useSupabaseClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.playlists({
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