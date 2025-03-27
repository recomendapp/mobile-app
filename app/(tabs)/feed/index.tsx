import { CardUserActivity } from "@/components/cards/CardUserActivity";
import FeedItem from "@/components/screens/feed/FeedItem";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ThemedText } from "@/components/ui/ThemedText"
import { ThemedView } from "@/components/ui/ThemedView"
import { useAuth } from "@/context/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { FlashList } from "@shopify/flash-list";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

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
	} = useUserFeedInfiniteQuery({
		userId: user?.id,
	});
	const loading = isLoading || feed === undefined;
	return (
		<FlashList
		data={feed?.pages.flat()}
		renderItem={({ item, index }) => (
			<View key={index} style={tw`p-1`}>
				<CardUserActivity activity={item} showReview />
			</View>
		)}
		ListEmptyComponent={() => !loading ? (
			<ThemedView style={tw`flex-1 items-center justify-center`}>
				<ThemedText>{upperFirst(t('common.messages.no_results'))}</ThemedText>
			</ThemedView>
		) : null}
		contentContainerStyle={{
			paddingTop: 8,
			paddingBottom: tabBarHeight,
			paddingLeft: 8,
			paddingRight: 8,
		}}
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={feed?.pages.flatMap((page) => page).length}
		showsVerticalScrollIndicator={false}
		refreshing={isFetching}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	);
};

export default FeedScreen;