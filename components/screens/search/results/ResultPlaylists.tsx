import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useTheme } from "@/context/ThemeProvider";
import { useSearchPlaylistsInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

const GRID_COLS = 3;

interface ResultPlaylistsProps {
	search: string;
}

const ResultPlaylists = ({
	search,
} : ResultPlaylistsProps) => {
	const { inset } = useTheme();
	const tabBarHeight = useBottomTabOverflow();
	const {
		data: results,
		isLoading,
		hasNextPage,
		fetchNextPage,
		isRefetching,
		refetch,
	} = useSearchPlaylistsInfiniteQuery({
		query: search,
	});
	const loading = isLoading || results === undefined;

	if (loading) {
		return null;
	}

	return (
		<FlashList
		data={results.pages.flat()}
		renderItem={({ item }) => (
			<View key={item.id} style={tw`p-1`}>
				<CardPlaylist playlist={item} />
			</View>
		)}
		keyExtractor={(item) => String(item.id)}
		numColumns={GRID_COLS}
		showsVerticalScrollIndicator={false}
		contentContainerStyle={{
			paddingLeft: 4,
			paddingRight: 4,
			paddingBottom: tabBarHeight + inset.bottom + 8,
		}}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		refreshing={isRefetching}
		onRefresh={refetch}
		estimatedItemSize={100}
		/>
	)
};

export default ResultPlaylists;