export const searchKeys = {
	search: ({
		locale
	} : {
		locale: string;
	}) => [locale, 'search'],

	multi: ({
		locale,
		query,
	} : {
		locale: string;
		query: string;
	}) => [searchKeys.search({ locale }), 'multi', query],

	movies: ({
		locale,
		query,
		filters
	} : {
		locale: string;
		query: string;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [searchKeys.search({ locale }), 'movies', query, ...sub]
	},

	tv_series: ({
		locale,
		query,
		filters
	} : {
		locale: string;
		query: string;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [searchKeys.search({ locale }), 'tv_series', query, ...sub]
	},

	persons: ({
		locale,
		query,
		filters
	} : {
		locale: string;
		query: string;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [searchKeys.search({ locale }), 'persons', query, ...sub]
	},

	users: ({
		locale,
		query,
		filters,
	} : {
		locale: string;
		query: string;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [searchKeys.search({ locale }), 'users', query, ...sub]
	},

	playlists: ({
		locale,
		query,
		filters
	} : {
		locale: string;
		query: string;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])]
		return [searchKeys.search({ locale }), 'playlists', query, ...sub]
	}
};