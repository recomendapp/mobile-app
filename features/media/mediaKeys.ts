import { MediaType, PlaylistType, UserActivityType, UserReviewType } from "@recomendapp/types"

export const mediaKeys = {
	all: ['media'] as const,

	specify: ({
		type,
	} : {
		type: MediaType;
	}) => [type] as const,
	
	detail: ({
		id,
		type,
		full,
	} : {
		id: number;
		type: MediaType;
		full?: boolean;
	}) => [...mediaKeys.specify({ type }), String(id), full] as const,
	
	seasonDetail: ({
		id,
		seasonNumber,
	} : {
		id: number;
		seasonNumber: number;
	}) => [...mediaKeys.detail({ id, type: 'tv_series' }), 'season', seasonNumber] as const,

	/* --------------------------------- REVIEWS -------------------------------- */
	reviews: ({
		id,
		type,
		filters,
	} : {
		id: number;
		type: UserReviewType;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])];
		return [...mediaKeys.detail({ id, type }), 'reviews', ...sub] as const;
	},
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- PLAYLISTS ------------------------------- */
	playlists: ({
		id,
		type,
		filters,
	} : {
		id: number;
		type: PlaylistType;
		filters?: any;
	}) => {
		const sub = [...(filters ? [filters] : [])];
		return [...mediaKeys.detail({ id, type }), 'playlists', ...sub] as const;
	},
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- FOLLOWERS ------------------------------- */

	followersAverageRating: ({
		id,
		type,
	} : {
		id: number;
		type: UserActivityType;
	}) => [...mediaKeys.detail({ id, type }), 'followersAverageRating'] as const,

	/* -------------------------------------------------------------------------- */

	/* --------------------------------- IMAGES --------------------------------- */
	posters: ({
		id,
		type,
		filters,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		filters?: any;
	}) => [...mediaKeys.detail({ id, type }), 'posters', filters] as const,
	backdrops: ({
		id,
		type,
		filters,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		filters?: any;
	}) => [...mediaKeys.detail({ id, type }), 'backdrops', filters] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*                                   PERSON                                   */
	/* -------------------------------------------------------------------------- */

	/* ------------------------------- FILMOGRAPHY ------------------------------ */
	mostRated: ({
		personId,
		filters,
	} : {
		personId: number;
		filters?: any;
	}) => filters ? [...mediaKeys.detail({ id: personId, type: 'person' }), 'mostRated', filters] as const : [...mediaKeys.detail({ id: personId, type: 'person' }), 'mostRated'] as const,
	/* -------------------------------------------------------------------------- */
}