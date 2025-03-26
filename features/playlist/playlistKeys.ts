export const playlistKeys = {
	all: ['playlist'] as const,

	featured: ({
		filter,
	} : {
		filter?: any;
	}) => filter ? [...playlistKeys.all, 'featured', filter] as const : [...playlistKeys.all, 'featured'] as const,
}