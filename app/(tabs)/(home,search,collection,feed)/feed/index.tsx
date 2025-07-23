import { CardUserActivity } from "@/components/cards/CardUserActivity";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ThemedText } from "@/components/ui/ThemedText"
import { ThemedView } from "@/components/ui/ThemedView"
import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { LegendList } from "@legendapp/list";

const FeedScreen = () => {
	const { user } = useAuth();
	const { t } = useTranslation();
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
			<ThemedView style={tw`flex-1 items-center justify-center`}>
				<ThemedText>{upperFirst(t('common.messages.no_results'))}</ThemedText>
			</ThemedView>
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