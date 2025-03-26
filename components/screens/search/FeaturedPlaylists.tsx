import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useTheme } from "@/context/ThemeProvider";
import { useUserPlaylistsFeaturedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { FlatList, View } from "react-native";

const GRID_COLUMNS = 3;

const FeaturedPlaylists = () => {
	const { inset } = useTheme();
	const bottomTabOverflow = useBottomTabOverflow();
	const {
		data: playlists,
		fetchNextPage,
		hasNextPage,
	} = useUserPlaylistsFeaturedInfiniteQuery();

	if (!playlists) return null;

	return (
		<FlatList
		data={playlists?.pages.flat().slice(0, 4)}
		renderItem={({ item: { playlist } }) => (
			<View key={playlist.id} style={{ flex: 1 / GRID_COLUMNS }}>
				<CardPlaylist playlist={playlist} />
			</View>
		)}
		numColumns={GRID_COLUMNS}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		contentContainerStyle={{
			paddingBottom: bottomTabOverflow + inset.bottom,
		}}
		showsVerticalScrollIndicator={false}
		columnWrapperStyle={tw`gap-2`}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		/>
	)
};

export default FeaturedPlaylists;