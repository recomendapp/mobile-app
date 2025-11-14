import { withPersistKey } from "@/features"

export const widgetKeys = {
	base: ['widget'] as const,

	mostRecommended: ({
		filters,
	} : {
		filters?: {
			limit?: number,
		}
	} = {}) => filters ? withPersistKey([...widgetKeys.base, 'most-recommended', filters]) : withPersistKey([...widgetKeys.base, 'most-recommended']),

	mostPopular: ({
		filters,
	} : {
		filters?: {
			perPage?: number,
		}
	} = {}) => filters ? withPersistKey([...widgetKeys.base, 'most-popular', filters]) : withPersistKey([...widgetKeys.base, 'most-popular']),
};