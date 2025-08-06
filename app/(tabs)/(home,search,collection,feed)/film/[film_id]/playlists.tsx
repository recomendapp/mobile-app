import MediaPlaylists from "@/components/screens/media/MediaPlaylists";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { useLocale, useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { upperFirst } from "lodash";
import { useAuth } from "@/providers/AuthProvider";
import MediaActionPlaylistAdd from "@/components/medias/actions/MediaActionPlaylistAdd";
import { Media } from "@/types/type.db";

const FilmPlaylists = () => {
	const locale = useLocale();
	const t = useTranslations();
	const { session } = useAuth();
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { data: movie } = useMediaMovieDetailsQuery({ id: movieId, locale: locale });
	return (
	<>
		<Stack.Screen
		options={{
			title: movie?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.playlist', { count: 2 }))}</HeaderTitle>,
			headerRight: session ? () => (
				<MediaActionPlaylistAdd
				media={movie as Media}
				/>
			) : undefined,
		}}
		/>
		<MediaPlaylists mediaId={movie?.media_id} />
	</>
	);
};

export default FilmPlaylists;