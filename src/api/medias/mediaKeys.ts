import { withPersistKey } from "@/api";

export const mediasKeys = {
	base: ['medias'] as const,

	details: ({
		type,
		id,
	} : {
		type: 'movie' | 'tv_series' | 'person';
		id: number;
	}) => [...mediasKeys.base, type, id] as const,

	tvSeriesSeasons: ({
		serieId,
	} : {
		serieId: number;
	}) => [...mediasKeys.details({ type: 'tv_series', id: serieId }), 'seasons'] as const,

	tvSeason: ({
		serieId,
		seasonNumber,
	} : {
		serieId: number;
		seasonNumber: number;
	}) => [...mediasKeys.details({ type: 'tv_series', id: serieId }), 'season', seasonNumber] as const,

	credits: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...mediasKeys.details({ id, type }), 'credits'] as const,

	cast: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...mediasKeys.details({ id, type }), 'cast'] as const,

	/* --------------------------------- PERSONS -------------------------------- */
	personFilms: ({
		personId,
		filters,
	} : {
		personId: number;
		filters: {
			sortBy: 'release_date' | 'vote_average';
			sortOrder: 'asc' | 'desc';
			department?: string;
			job?: string;
		}
	}) => [...mediasKeys.details({ type: 'person', id: personId }), 'films', filters] as const,

	personTvSeries: ({
		personId,
		filters,
	} : {
		personId: number;
		filters: {
			sortBy: 'last_appearance_date' | 'first_air_date' | 'vote_average';
			sortOrder: 'asc' | 'desc';
			department?: string;
			job?: string;
		}
	}) => [...mediasKeys.details({ type: 'person', id: personId }), 'tv_series', filters] as const,

	/* --------------------------------- REVIEWS -------------------------------- */
	reviews: ({
		id,
		type,
		filters,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		filters?: {
			sortBy: 'updated_at' | 'created_at' | 'likes_count';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...mediasKeys.details({ id, type }), 'reviews', filters] as const : [...mediasKeys.details({ id, type }), 'reviews'] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- PLAYLISTS ------------------------------- */
	playlists: ({
		id,
		type,
		filters,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		filters?: {
			sortBy: 'created_at' | 'updated_at' | 'likes_count';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...mediasKeys.details({ id, type }), 'playlists', filters] as const : [...mediasKeys.details({ id, type }), 'playlists'] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- FOLLOWERS ------------------------------- */
	followersAverageRatings: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...mediasKeys.details({ id, type }), 'followersAverageRatings'] as const,
	followersAverageRating: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...mediasKeys.details({ id, type }), 'followersAverageRating'] as const,
	/* -------------------------------------------------------------------------- */

	/* --------------------------------- IMAGES --------------------------------- */
	posters: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...mediasKeys.details({ id, type }), 'posters'] as const,
	backdrops: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...mediasKeys.details({ id, type }), 'backdrops'] as const,
	/* -------------------------------------------------------------------------- */

	/* ------------------------------- GENRES ------------------------------ */

	genres: () => {
		return withPersistKey([...mediasKeys.base, 'genres'] as const);
	},


}