export const searchKeys = {
	all: ({
		locale
	} : {
		locale: string;
	}) => [locale, 'search'],

	multi: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters: any;
	}) => [locale, 'search', 'multi', query, JSON.stringify(filters)],


	movies: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters: any;
	}) => [locale, 'search', 'movies', query, JSON.stringify(filters)],

	tvSeries: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters: any;
	}) => [locale, 'search', 'tv_series', query, JSON.stringify(filters)],

	persons: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters: any;
	}) => [locale, 'search', 'persons', query, JSON.stringify(filters)],

	playlists: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters: any;
	}) => [locale, 'search', 'playlists', query, JSON.stringify(filters)],
};