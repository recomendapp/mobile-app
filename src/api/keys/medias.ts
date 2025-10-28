import { MediaType } from "@recomendapp/types";

export const mediaKeys = {
	base: ['medias'] as const,

	details: ({
		mediaId,
		mediaType,
		full = false,
	} : {
		mediaId: number;
		mediaType: MediaType;
		full?: boolean;
	}) => {
		const sub = full ? ['full'] : [];
		return [...mediaKeys.base, mediaType, String(mediaId), ...sub] as const;
	},

	genres: () => {
		return [...mediaKeys.base, 'genres'] as const;
	},


}