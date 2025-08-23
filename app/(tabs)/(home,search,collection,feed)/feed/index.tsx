import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { LegendList } from "@legendapp/list";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_VERTICAL } from "@/theme/globals";
import { CardFeedActivityMovie } from "@/components/cards/feed/CardFeedActivityMovie";
import { UserFeedItem } from "@/types/type.db";
import { CardFeedActivityTvSeries } from "@/components/cards/feed/CardFeedActivityTvSeries";

const FeedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { bottomTabHeight, colors } = useTheme();
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
			tw`px-4 gap-1`,
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={feed?.pages.flatMap((page) => page).length}
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