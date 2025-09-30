export const widgetKeys = {
	all: ['widget'] as const,

	widget: ({
		name,
		filters,
	} : {
		name: string,
		filters?: any,
	}) => filters ? [...widgetKeys.all, name, filters] : [...widgetKeys.all, name] as const,
};