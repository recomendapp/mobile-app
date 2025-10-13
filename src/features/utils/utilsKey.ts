import { withPersistKey } from "..";

export const utilsKey = {
	// Novu
	novu: ['novu'] as const,
	novuSubscriber: (subscriberId: string) => [...utilsKey.novu, 'subscriber', subscriberId] as const,
	novuSubscriberHash: (subscriberId: string) => [...utilsKey.novuSubscriber(subscriberId), 'hash'] as const,

	// Notifications
	notifications: ({
		view,
		filters,
	}: {
		view?: 'all' | 'unread' | 'archived';
		filters?: {
			archived?: boolean;
			read?: boolean;
			perPage?: number;
		};
	} = {}) => {
		const sub = [...(view ? [view] : []), ...(filters ? [filters] : [])];
		return withPersistKey(['notifications', ...sub]);
	},
};