import { withPersistKey } from "@/features";

export const exploreKeys = {
	base: ['explore'] as const,

	tile: ({
		exploreId,
		locale,
	} : {
		exploreId: string;
		locale: string;
	}) => withPersistKey([...exploreKeys.base, 'tile', { exploreId, locale }]),
};