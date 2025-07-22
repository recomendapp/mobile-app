import MediaPlaylists from "@/components/screens/media/MediaPlaylists";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

const TvSeriesPlaylists = () => {
	const { i18n } = useTranslation();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { data: series } = useMediaTvSeriesDetailsQuery({ id: seriesId, locale: i18n.language });
	return (
		<MediaPlaylists mediaId={series?.media_id} />
	);
};

export default TvSeriesPlaylists;