import { MovieSearchQuery, PersonSearchQuery, PlaylistSearchQuery, TvSeriesSearchQuery, UserSearchQuery } from "@recomendapp/types";

export const searchKeys = {
	base: ['search'] as const,

	search: ({
		locale
	} : {
		locale: string;
	}) => [...searchKeys.base, locale],

	multi: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: {
			perPage?: number;
		}
	}) => {
		const sub = [...(filters ? [filters] : [])] 
		return [...searchKeys.search({ locale: locale }), 'multi', query, ...sub]
	},

	movies: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: Omit<MovieSearchQuery, 'query' | 'page'>
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [...searchKeys.search({ locale: locale }), 'movies', query, ...sub]
	},

	tvSeries: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: Omit<TvSeriesSearchQuery, 'query' | 'page'>
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [...searchKeys.search({ locale: locale }), 'tv_series', query, ...sub]
	},

	persons: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: Omit<PersonSearchQuery, 'query' | 'page'>
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [...searchKeys.search({ locale: locale }), 'persons', query, ...sub]
	},

	users: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: Omit<UserSearchQuery, 'query' | 'page'>
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [...searchKeys.search({ locale: locale }), 'users', query, ...sub]
	},

	playlists: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: Omit<PlaylistSearchQuery, 'query' | 'page'>
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [...searchKeys.search({ locale: locale }), 'playlists', query, ...sub]
	},
};