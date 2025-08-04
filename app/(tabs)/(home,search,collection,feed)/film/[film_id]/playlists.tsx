import MediaPlaylists from "@/components/screens/media/MediaPlaylists";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { useLocalSearchParams } from "expo-router";
import { useLocale } from "use-intl";

const FilmPlaylists = () => {
	const locale = useLocale();
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { data: movie } = useMediaMovieDetailsQuery({ id: movieId, locale: locale });
	return (
		<MediaPlaylists mediaId={movie?.media_id} />
	);
};

export default FilmPlaylists;