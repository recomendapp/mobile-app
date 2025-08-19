// import MediaPlaylists from "@/components/screens/media/MediaPlaylists";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { useLocale, useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { upperFirst } from "lodash";
import { useAuth } from "@/providers/AuthProvider";
import MediaActionPlaylistAdd from "@/components/medias/actions/MediaActionPlaylistAdd";
// import { Media } from "@/types/type.db";

const TvSeriesPlaylists = () => {
	const locale = useLocale();
	const t = useTranslations();
	const { session } = useAuth();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { data: series } = useMediaTvSeriesDetailsQuery({ id: seriesId, locale: locale });
	return (
	<>
		<Stack.Screen
		options={{
			title: series?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.playlist', { count: 2 }))}</HeaderTitle>,
			// headerRight: session ? () => (
			// 	<MediaActionPlaylistAdd
			// 	media={series as Media}
			// 	/>
			// ) : undefined,
		}}
		/>
		{/* <MediaPlaylists mediaId={series?.media_id} /> */}
	</>
	);
};

export default TvSeriesPlaylists;