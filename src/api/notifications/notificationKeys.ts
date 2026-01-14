import { withPersistKey } from "@/api";

export const notificationKeys = {
	base: ['notifications'] as const,

	list: ({
		view,
	} : {
		view?: 'all' | 'unread' | 'archived';
	} = {}) => view ? withPersistKey([...notificationKeys.base, 'list', view]) : withPersistKey([...notificationKeys.base, 'list']),
}