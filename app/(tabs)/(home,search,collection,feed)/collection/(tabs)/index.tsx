import { CardPlaylist } from "@/components/cards/CardPlaylist";
import useCollectionStaticRoutes from "@/components/screens/collection/useCollectionStaticRoutes";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { useTheme } from "@/providers/ThemeProvider";

const CollectionScreen = () => {
	const { user } = useAuth();
	const { inset } = useTheme();
	const tabBarHeight = useBottomTabOverflow();
	const staticRoutes = useCollectionStaticRoutes();
	const {
		data: playlists,
		isLoading,
		isRefetching,
		fetchNextPage,
		refetch,
		hasNextPage,
	} = useUserPlaylistsInfiniteQuery({
		userId: user?.id,
	});

	const combinedItems = [
		...staticRoutes,
		...(playlists?.pages.flatMap((page) => page) ?? []),
	];


	return (
		<LegendList
		data={combinedItems}
		renderItem={({ item, index } : { item: any, index: number }) => {
			if (item.type === 'static') {
			  return (
				<Link key={item.key} href={item.href} style={tw`p-1`}>
				  {item.icon}
				  <View style={tw`w-full items-center`}>
				  	<ThemedText>{item.label}</ThemedText>
				  </View>
				</Link>
			  );
			} else {
			  return (
				<View key={index} style={tw`p-1`}>
				  <CardPlaylist playlist={item} style={tw`w-full`} showPlaylistAuthor={false} showItemsCount />
				</View>
			  );
			}
		}}
		refreshing={isRefetching}
		onRefresh={refetch}
		numColumns={3}
		contentContainerStyle={{
			paddingBottom: tabBarHeight + inset.bottom,
		}}
		keyExtractor={(_, index) => index.toString()}
		showsVerticalScrollIndicator={false}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionScreen;