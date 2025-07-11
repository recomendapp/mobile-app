import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsSavedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

const CollectionSavedScreen = () => {
	const { user } = useAuth();
	const tabBarHeight = useBottomTabOverflow();
	const {
		data: playlists,
		isLoading,
		isFetching,
		isRefetching,
		fetchNextPage,
		refetch,
		hasNextPage,
	} = useUserPlaylistsSavedInfiniteQuery({
		userId: user?.id,
	});
	const loading = isLoading || playlists === undefined;

	return (
		<FlashList
		data={playlists?.pages.flatMap((page) => page) ?? []}
		renderItem={({ item, index }) => (
			<View key={index} style={tw`p-1`}>
				<CardPlaylist playlist={item.playlist} style={tw`w-full`} />
			</View>
		)}
		refreshing={isRefetching}
		onRefresh={refetch}
		numColumns={3}
		contentContainerStyle={{
			paddingBottom: tabBarHeight,
		}}
		keyExtractor={(_, index) => index.toString()}
		showsVerticalScrollIndicator={false}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionSavedScreen;