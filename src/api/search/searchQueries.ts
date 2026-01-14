import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocale } from "use-intl";
import { useApiClient } from "@/providers/ApiProvider";
import { searchMoviesOptions, searchMultiOptions, searchPersonsOptions, searchPlaylistsOptions, searchTvSeriesOptions, searchUsersOptions } from "./searchOptions";

export const useSearchMultiQuery = ({
	query,
	filters,
} : {
	query: string;
	filters?: {
		perPage?: number;
	}
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return useQuery(searchMultiOptions({
		api,
		locale,
		query,
		filters,
	}))
};

export const useSearchMoviesQuery = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return useInfiniteQuery(searchMoviesOptions({
		api,
		locale,
		query,
	}));
};

export const useSearchTvSeriesQuery = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return useInfiniteQuery(searchTvSeriesOptions({
		api,
		locale,
		query,
	}));
};

export const useSearchPersonsQuery = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return useInfiniteQuery(searchPersonsOptions({
		api,
		locale,
		query,
	}));
};

export const useSearchUsersQuery = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return useInfiniteQuery(searchUsersOptions({
		api,
		locale,
		query,
	}));
};

export const useSearchPlaylistsQuery = ({
	query,
} : {
	query?: string;
}) => {
	const locale = useLocale();
	const api = useApiClient();
	return useInfiniteQuery(searchPlaylistsOptions({
		api,
		locale,
		query,
	}));
};