import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useTheme } from "@/providers/ThemeProvider";
import { usePlaylistFeaturedInfiniteQuery } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { StyleProp, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";

const GRID_COLUMNS = 3;

interface FeaturedPlaylistsProps {
	contentContainerStyle?: StyleProp<ViewStyle>;
}

const FeaturedPlaylists = ({
	contentContainerStyle,
}: FeaturedPlaylistsProps) => {
	const { inset } = useTheme();
	const bottomTabOverflow = useBottomTabOverflow();
	const {
		data: playlists,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = usePlaylistFeaturedInfiniteQuery();

	if (!playlists) return null;

	return (
		<LegendList
		data={playlists?.pages.flat()}
		renderItem={({ item: { playlist } }) => (
			<View key={playlist.id} style={{ flex: 1 / GRID_COLUMNS }}>
				<CardPlaylist playlist={playlist} />
			</View>
		)}
		numColumns={GRID_COLUMNS}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		contentContainerStyle={[
			{
				paddingBottom: bottomTabOverflow + inset.bottom,
			},
			contentContainerStyle,
		]}
		keyExtractor={(item) => item.playlist.id.toString()}
		showsVerticalScrollIndicator={false}
		columnWrapperStyle={tw`gap-2`}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	)
};

export default FeaturedPlaylists;