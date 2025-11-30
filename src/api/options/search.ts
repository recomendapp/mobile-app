import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { useLocale } from "use-intl";
import { Keys } from "../keys";
import { useApiClient } from "@/providers/ApiProvider";

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
	const api = useApiClient();
	return queryOptions({
		queryKey: Keys.search.multi({ locale: locale, query: query, filters: filters }),
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

export const useSearchMoviesOptions = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.movies({
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

export const useSearchTvSeriesOptions = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.tvSeries({
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

export const useSearchPersonsOptions = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.persons({
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

export const useSearchUsersOptions = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.users({
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

export const useSearchPlaylistsOptions = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return infiniteQueryOptions({
		queryKey: Keys.search.playlists({
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