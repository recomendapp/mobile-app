import { withPersistKey } from "@/api";

export const notificationsKeys = {
	base: ['notifications'] as const,

	list: ({
		view,
	} : {
		view?: 'all' | 'unread' | 'archived';
	} = {}) => view ? withPersistKey([...notificationsKeys.base, 'list', view]) : withPersistKey([...notificationsKeys.base, 'list']),
}