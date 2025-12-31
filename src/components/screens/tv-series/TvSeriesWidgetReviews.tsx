import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { MediaTvSeries, UserReviewTvSeries } from "@recomendapp/types";
import { CardReviewTvSeries } from "@/components/cards/reviews/CardReviewTvSeries";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMediaTvSeriesReviewsQuery } from "@/api/medias/mediaQueries";

interface TvSeriesWidgetReviewsProps extends React.ComponentPropsWithoutRef<typeof View> {
	tvSeries: MediaTvSeries;
	url: Href;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const TvSeriesWidgetReviews = ({
	tvSeries,
	url,
	style,
	labelStyle,
	containerStyle,
} : TvSeriesWidgetReviewsProps) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const urlReviews = `${url}/reviews` as Href;
	const {
		data: reviews,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = useMediaTvSeriesReviewsQuery({
		tvSeriesId: tvSeries.id,
		filters: {
			sortBy: 'updated_at',
			sortOrder: 'desc',
		}
	});
	const loading = reviews === undefined || isLoading;

	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={urlReviews} style={labelStyle}>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.review', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<LegendList<UserReviewTvSeries>
		key={loading ? 'loading' : 'reviews'}
		data={loading ? new Array(3).fill(null) : reviews?.pages.flat()}
		renderItem={({ item }) => (
			!loading ? (
				<CardReviewTvSeries
				review={item}
				activity={item.activity!}
				author={item.activity?.user!} style={tw`w-86`}
				url={`/tv-series/${tvSeries?.slug || tvSeries?.id}/review/${item.id}`}
				/>
			) : (
				<CardReviewTvSeries skeleton style={tw`w-86`} />
			)
		)}
		ListEmptyComponent={
			<Text style={[tw``, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_reviews'))}
			</Text>
		}
		snapToInterval={352}
		decelerationRate="fast"
		keyExtractor={(item, index) => loading ? index.toString() : item.id.toString()}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw`w-2`} />}
		contentContainerStyle={containerStyle}
		nestedScrollEnabled
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		/>
	</View>
	);
};

export default TvSeriesWidgetReviews;
