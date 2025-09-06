export const utilsKey = {
	// Novu
	novu: ['novu'] as const,
	novuSubscriber: (subscriberId: string) => [...utilsKey.novu, 'subscriber', subscriberId] as const,
	novuSubscriberHash: (subscriberId: string) => [...utilsKey.novuSubscriber(subscriberId), 'hash'] as const
};