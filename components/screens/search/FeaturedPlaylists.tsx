import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useTheme } from "@/providers/ThemeProvider";
import { usePlaylistFeaturedInfiniteQuery } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { StyleProp, View, ViewStyle } from "react-native";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useCallback, useMemo, useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { Playlist } from "@recomendapp/types";

const GRID_COLUMNS = 3;
interface FeaturedPlaylistsProps {
	contentContainerStyle?: StyleProp<ViewStyle>;
}

const FeaturedPlaylists = ({
	contentContainerStyle,
} : FeaturedPlaylistsProps) => {
	const { bottomTabHeight } = useTheme();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = usePlaylistFeaturedInfiniteQuery();
	const playlists = useMemo(() => data?.pages.flat() || [], [data]);
	// REFs
	const scrollRef = useRef<LegendListRef>(null);

	// Callbacks
	const renderItem = useCallback(({ item }: { item: { playlist: Playlist } }) => (
		<CardPlaylist playlist={item.playlist} />
	), []);
	const keyExtractor = useCallback((item: { playlist: Playlist }) => 
		item.playlist.id.toString(), 
		[]
	);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);
	const itemSeparator = useCallback(() => <View style={tw`h-2`} />, []);

	useScrollToTop(scrollRef);

	return (
		<LegendList
		ref={scrollRef}
		data={playlists}
		renderItem={renderItem}
		numColumns={GRID_COLUMNS}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		contentContainerStyle={[
			{
				paddingBottom: bottomTabHeight + 8,
			},
			contentContainerStyle,
		]}
		keyExtractor={keyExtractor}
		showsVerticalScrollIndicator={false}
		columnWrapperStyle={tw`gap-2`}
		ItemSeparatorComponent={itemSeparator}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	)
};
FeaturedPlaylists.displayName = 'FeaturedPlaylists';

export default FeaturedPlaylists;