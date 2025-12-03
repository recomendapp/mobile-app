import { TMDB_IMAGE_BASE_URL } from "@/env";

type TmdbImageProps = {
	path?: string | null;
	size: 'w92' | 'w154' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';
};

export const getTmdbImage = ({
	path, size,
}: TmdbImageProps): string => {
	if (!path) return '';
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return `${TMDB_IMAGE_BASE_URL}/${size}${cleanPath}`;
};