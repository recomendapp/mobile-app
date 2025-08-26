import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { LegendList } from "@legendapp/list";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CardFeedActivityMovie } from "@/components/cards/feed/CardFeedActivityMovie";
import { UserFeedItem } from "@/types/type.db";
import { CardFeedActivityTvSeries } from "@/components/cards/feed/CardFeedActivityTvSeries";
import { CardFeedPlaylistLike } from "@/components/cards/feed/CardFeedPlaylistLike";
import { CardFeedReviewMovieLike } from "@/components/cards/feed/CardFeedReviewMovieLike";
import { CardFeedReviewTvSeriesLike } from "@/components/cards/feed/CardFeedReviewTvSeriesLike";
import { useHeaderHeight } from "@react-navigation/elements";

const FeedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { bottomTabHeight, colors } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	const {
		data: feed,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useUserFeedInfiniteQuery({
		userId: user?.id,
	});
	const loading = isLoading || feed === undefined;

	// Render 
	const renderItem = ({ item, index } : { item: UserFeedItem, index: number }) => {
		switch (item.activity_type) {
			case 'activity_movie':
				const { movie, ...activityMovie } = item.content;
				return <CardFeedActivityMovie author={item.author} activity={activityMovie} movie={movie!} />;
			case 'activity_tv_series':
				const { tv_series, ...activityTvSeries } = item.content;
				return <CardFeedActivityTvSeries author={item.author} activity={activityTvSeries} tvSeries={tv_series!} />;
			case 'playlist_like':
				return <CardFeedPlaylistLike author={item.author} playlistLike={item.content} />;
			case 'review_movie_like':
				return <CardFeedReviewMovieLike author={item.author} reviewLike={item.content} movie={item.content.review?.activity?.movie!} />;
			case 'review_tv_series_like':
				return <CardFeedReviewTvSeriesLike author={item.author} reviewLike={item.content} tvSeries={item.content.review?.activity?.tv_series!} />;
			default:
				return <View style={[{ backgroundColor: colors.muted}, tw`p-4 rounded-md`]}><Text textColor="muted" style={tw`text-center`}>Unsupported activity type</Text></View>;
		}
	};

	return (
		<LegendList
		data={feed?.pages.flat() || []}
		renderItem={renderItem}
		ListEmptyComponent={() => !loading ? (
			<View style={tw`flex-1 items-center justify-center`}>
				<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		) : null}
		contentContainerStyle={[
			tw`gap-1`,
			{
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingTop: navigationHeaderHeight + PADDING_VERTICAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		keyExtractor={(_, index) => index.toString()}
		showsVerticalScrollIndicator={false}
		refreshing={isFetching}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		onRefresh={refetch}
		/>
	);
};

export default FeedScreen;