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
		mediaId,
		filters,
	} : {
		mediaId: number;
		filters?: any;
	}) => filters ? [...mediaKeys.detail({ id: mediaId }), 'reviews', filters] as const : [...mediaKeys.detail({ id: mediaId }), 'reviews'] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- PLAYLISTS ------------------------------- */
	playlists: ({
		mediaId,
		filters,
	} : {
		mediaId: number;
		filters?: any;
	}) => filters ? [...mediaKeys.detail({ id: mediaId }), 'playlists', filters] as const : [...mediaKeys.detail({ id: mediaId }), 'playlists'] as const,
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