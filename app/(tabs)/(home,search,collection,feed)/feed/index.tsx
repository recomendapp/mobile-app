import { CardUserActivity } from "@/components/cards/CardUserActivity";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { LegendList } from "@legendapp/list";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";

const FeedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const tabBarHeight = useBottomTabOverflow();
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
	return (
		<LegendList
		data={feed?.pages.flat() || []}
		renderItem={({ item, index }) => (
			<View key={index} style={tw`py-1`}>
				<CardUserActivity activity={item} showReview />
			</View>
		)}
		ListEmptyComponent={() => !loading ? (
			<View style={tw`flex-1 items-center justify-center`}>
				<Text variant="muted">{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		) : null}
		contentContainerStyle={[
			tw`px-4`,
			{
				paddingBottom: tabBarHeight
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