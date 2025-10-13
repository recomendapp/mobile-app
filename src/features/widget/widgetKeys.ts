import { withPersistKey } from "..";

export const widgetKeys = {
	all: ['widget'] as const,

	widget: ({
		name,
		filters,
	} : {
		name: string,
		filters?: any,
	}) => filters ? withPersistKey([...widgetKeys.all, name, filters]) : withPersistKey([...widgetKeys.all, name]),
};