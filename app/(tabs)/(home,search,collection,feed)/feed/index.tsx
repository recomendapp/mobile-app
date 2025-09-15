import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { LegendList, LegendListRef } from "@legendapp/list";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CardFeedActivityMovie } from "@/components/cards/feed/CardFeedActivityMovie";
import { UserFeedItem } from "@recomendapp/types";
import { CardFeedActivityTvSeries } from "@/components/cards/feed/CardFeedActivityTvSeries";
import { CardFeedPlaylistLike } from "@/components/cards/feed/CardFeedPlaylistLike";
import { CardFeedReviewMovieLike } from "@/components/cards/feed/CardFeedReviewMovieLike";
import { CardFeedReviewTvSeriesLike } from "@/components/cards/feed/CardFeedReviewTvSeriesLike";
import { useScrollToTop } from "@react-navigation/native";
import { useCallback, useMemo, useRef } from "react";

const FeedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { bottomTabHeight, colors } = useTheme();
	const {
		data,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useUserFeedInfiniteQuery({
		userId: user?.id,
	});
	const loading = isLoading || data === undefined;
	const feed = useMemo(() => data?.pages.flat() || [], [data]);
	// REFs
	const scrollRef = useRef<LegendListRef>(null);
	useScrollToTop(scrollRef);

	// useCallback
	const keyExtractor = useCallback((item: UserFeedItem) => (
		item.feed_id.toString()
	), []);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);

	// Render 
	const renderItem = useCallback(({ item } : { item: UserFeedItem, index: number }) => {
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
	}, []);
	const renderEmpty = useCallback(() => (
		!loading ? (
			<Text style={tw`text-center`} textColor='muted'>{upperFirst(t('common.messages.no_activity'))}</Text>
		) : null
	), [t, loading]);

	return (
		<LegendList
		ref={scrollRef}
		data={feed}
		renderItem={renderItem}
		ListEmptyComponent={renderEmpty}
		contentContainerStyle={[
			tw`gap-1`,
			{
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		keyExtractor={keyExtractor}
		showsVerticalScrollIndicator={false}
		refreshing={isFetching}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		onRefresh={refetch}
		/>
	);
};

export default FeedScreen;