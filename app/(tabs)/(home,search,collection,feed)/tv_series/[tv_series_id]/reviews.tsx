import MediaReviews from "@/components/screens/media/MediaReviews";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { useAuth } from "@/providers/AuthProvider";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useLocale, useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";

const TvSeriesReviews = () => {
	const locale = useLocale();
	const t = useTranslations();
	const { user } = useAuth();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { data: series } = useMediaTvSeriesDetailsQuery({ id: seriesId, locale: locale });

	const {
		data: activity,
		isLoading,  
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: series?.media_id,
	});
	const loadingActivity = activity === undefined || isLoading;

	return (
	<>
		<Stack.Screen
		options={{
			title: series?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.review', { count: 2 }))}</HeaderTitle>,
			headerRight: !loadingActivity ? () => (
				<Link href={activity?.review ? `/review/${activity?.review?.id}` : `/review/create/${series?.media_id}`} asChild>
					<Button
					variant="ghost"
					icon={activity?.review ? Icons.Eye : Icons.Edit}
					size="icon"
					/>
				</Link>
			) : undefined,
		}}
		/>
		<MediaReviews mediaId={series?.media_id} />
	</>
	)
};

export default TvSeriesReviews;