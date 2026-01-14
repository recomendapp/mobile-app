export const uiKeys = {
	base: ['ui'] as const,

	backgrounds: () => [...uiKeys.base, 'backgrounds'] as const,
};