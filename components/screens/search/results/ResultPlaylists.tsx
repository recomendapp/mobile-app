import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useTheme } from "@/providers/ThemeProvider";
import { useSearchPlaylistsInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { FlashList } from "@shopify/flash-list";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

const GRID_COLS = 3;

interface ResultPlaylistsProps {
	search: string;
}

const ResultPlaylists = ({
	search,
} : ResultPlaylistsProps) => {
	const { t } = useTranslation();
	const { inset, colors } = useTheme();
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

	return (
		<FlashList
		data={results?.pages.flat()}
		renderItem={({ item }) => (
			<View key={item.id} style={tw`p-1`}>
				<CardPlaylist playlist={item} />
			</View>
		)}
		ListEmptyComponent={() => (
			loading ? (
				<ActivityIndicator />
			) : (
				<View style={tw`p-2 items-center justify-center`}>
					<Text style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_results'))}</Text>
				</View>
			)
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