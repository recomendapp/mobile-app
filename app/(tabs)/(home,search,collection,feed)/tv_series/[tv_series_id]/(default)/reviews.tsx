import MediaReviews from "@/components/screens/media/MediaReviews";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { useLocalSearchParams } from "expo-router";
import { useLocale } from "use-intl";

const TvSeriesReviews = () => {
	const locale = useLocale();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { data: series } = useMediaTvSeriesDetailsQuery({ id: seriesId, locale: locale });
	return (
		<MediaReviews mediaId={series?.media_id} />
	)
};

export default TvSeriesReviews;