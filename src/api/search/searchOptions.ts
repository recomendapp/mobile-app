import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { searchKeys } from "./searchKeys";
import { ApiClient } from "@recomendapp/api-js";

export const searchMultiOptions = ({
	api,
	locale,
	query,
	filters,
} : {
	api: ApiClient;
	locale: string;
	query: string;
	filters?: {
		perPage?: number;
	}
}) => {
	const mergedFilters = {
		perPage: 10,
		...filters
	}
	return queryOptions({
		queryKey: searchKeys.multi({ locale: locale, query: query, filters: filters }),
		queryFn: async () => {
			const { data, error } = await api.search.bestResult({
				query: {
					q: query,
					per_page: mergedFilters.perPage,
				}
			});
			if (error || !data) throw error;
			return data;
		},
		enabled: !!query && !!query.length,
	})
};

export const searchMoviesOptions = ({
	api,
	locale,
	query,
} : {
	api: ApiClient;
	locale: string;
	query?: string;
}) => {
	return infiniteQueryOptions({
		queryKey: searchKeys.movies({
			locale: locale,
			query: query!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const { data, error } = await api.search.movies({
				query: {
					q: query,
					page: pageParam,
				}
			});
			if (error || !data) throw error;
			return data;
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

export const searchTvSeriesOptions = ({
	api,
	locale,
	query,
} : {
	api: ApiClient;
	locale: string;
	query?: string;
}) => {
	return infiniteQueryOptions({
		queryKey: searchKeys.tvSeries({
			locale: locale,
			query: query!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const { data, error } = await api.search.tvSeries({
				query: {
					q: query,
					page: pageParam,
				}
			});
			if (error || !data) throw error;
			return data;
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

export const searchPersonsOptions = ({
	api,
	locale,
	query,
} : {
	api: ApiClient;
	locale: string;
	query?: string;
}) => {
	return infiniteQueryOptions({
		queryKey: searchKeys.persons({
			locale: locale,
			query: query!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const { data, error } = await api.search.persons({
				query: {
					q: query,
					page: pageParam,
				}
			});
			if (error || !data) throw error;
			return data;
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

export const searchUsersOptions = ({
	api,
	locale,
	query,
} : {
	api: ApiClient;
	locale: string;
	query?: string;
}) => {
	return infiniteQueryOptions({
		queryKey: searchKeys.users({
			locale: locale,
			query: query!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const { data, error } = await api.search.users({
				query: {
					q: query,
					page: pageParam,
				}
			});
			if (error || !data) throw error;
			return data;
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

export const searchPlaylistsOptions = ({
	api,
	locale,
	query,
} : {
	api: ApiClient;
	locale: string;
	query?: string;
}) => {
	return infiniteQueryOptions({
		queryKey: searchKeys.playlists({
			locale: locale,
			query: query!,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			if (!query) throw new Error("Query is required");
			const { data, error } = await api.search.playlists({
				query: {
					q: query,
					page: pageParam,
				}
			});
			if (error || !data) throw error;
			return data;
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