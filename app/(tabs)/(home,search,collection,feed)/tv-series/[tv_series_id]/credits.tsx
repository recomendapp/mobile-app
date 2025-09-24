import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLocale } from "use-intl";

const TvSeriesCreditsScreen = () => {
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const locale = useLocale();
	const router = useRouter();
	const {
		data: series,
		isLoading,
		isRefetching,
		refetch,
	} = useMediaTvSeriesDetailsQuery({
		id: seriesId,
		locale: locale,
	});
	const loading = series === undefined || isLoading;

	return (
	<>
		<View>
			<Text>TvSeries Credits</Text>
		</View>
	</>
	)
};

export default TvSeriesCreditsScreen;