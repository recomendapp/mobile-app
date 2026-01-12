import { withPersistKey } from "@/api"

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

	users: ({
		filters,
	} : {
		filters?: {
			sortBy?: 'created_at' | 'followers_count',
			sortOrder?: 'asc' | 'desc',
		}
	} = {}) => filters ? [...widgetKeys.base, 'users', filters] as const : [...widgetKeys.base, 'users'] as const,
};