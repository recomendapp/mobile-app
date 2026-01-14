export const novuKeys = {
	base: ['novu'] as const,
	novuSubscriber: (subscriberId: string) => [...novuKeys.base, 'subscriber', subscriberId] as const,
	novuSubscriberHash: (subscriberId: string) => [...novuKeys.novuSubscriber(subscriberId), 'hash'] as const,
}