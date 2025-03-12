import { MediaType } from "@/types/type.db"

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
	} : {
		id: number;
		type?: MediaType;
	}) => type
		? [mediaKeys.specify({ type }), String(id)] as const
		: [...mediaKeys.all, id] as const,

	/* --------------------------------- REVIEWS -------------------------------- */
	reviews: ({
		id,
		filters,
	} : {
		id: number;
		filters?: any;
	}) => filters ? [...mediaKeys.detail({ id }), 'reviews', filters] as const : [...mediaKeys.detail({ id }), 'reviews'] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- PLAYLISTS ------------------------------- */
	playlists: ({
		id,
		filters,
	} : {
		id: number;
		filters?: any;
	}) => filters ? [...mediaKeys.detail({ id }), 'playlists', filters] as const : [...mediaKeys.detail({ id }), 'playlists'] as const,
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