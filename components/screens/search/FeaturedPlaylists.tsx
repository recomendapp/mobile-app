import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useTheme } from "@/providers/ThemeProvider";
import { usePlaylistFeaturedInfiniteQuery } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { StyleProp, View, ViewStyle } from "react-native";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";

const GRID_COLUMNS = 3;

interface FeaturedPlaylistsProps {
	contentContainerStyle?: StyleProp<ViewStyle>;
}

const FeaturedPlaylists = ({
	contentContainerStyle,
}: FeaturedPlaylistsProps) => {
	const { bottomTabHeight } = useTheme();
	const {
		data: playlists,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = usePlaylistFeaturedInfiniteQuery();
	// REFs
	const scrollRef = useRef<LegendListRef>(null);
	useScrollToTop(scrollRef);

	if (!playlists) return null;

	return (
		<LegendList
		ref={scrollRef}
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
				paddingBottom: bottomTabHeight + 8,
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