import { withPersistKey } from "@/api";

export const exploreKeys = {
	base: ['explore'] as const,

	tileMeta: ({
		exploreId,
		locale,
	} : {
		exploreId: number;
		locale: string;
	}) => [...exploreKeys.base, 'tile-metadata', { exploreId, locale }],

	tile: ({
		exploreId,
		locale,
	} : {
		exploreId: number;
		locale: string;
	}) => withPersistKey([...exploreKeys.base, 'tile', { exploreId, locale }]),
};