import MediaReviews from "@/components/screens/media/MediaReviews";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useLocale, useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import ButtonMyReview from "@/components/buttons/ButtonMyReview";

const TvSeriesReviews = () => {
	const locale = useLocale();
	const t = useTranslations();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { data: series } = useMediaTvSeriesDetailsQuery({ id: seriesId, locale: locale });
	return (
	<>
		<Stack.Screen
		options={{
			title: series?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.review', { count: 2 }))}</HeaderTitle>,
			headerRight: series?.media_id ? () => (
				<>
					<ButtonMyReview mediaId={series?.media_id!} size="icon" />
				</>
			) : undefined,
		}}
		/>
		<MediaReviews mediaId={series?.media_id} />
	</>
	)
};

export default TvSeriesReviews;