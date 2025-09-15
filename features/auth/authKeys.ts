export const authKeys = {
	base: ['auth'] as const,

	user: () => [...authKeys.base, 'user'] as const,
	session: () => [...authKeys.base, 'session'] as const,
	
	entitlements: () => [...authKeys.base, 'entitlements'] as const,
	customerInfo: () => [...authKeys.base, 'customerInfo'] as const,
};