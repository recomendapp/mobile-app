import { CardPlaylist } from "@/components/cards/CardPlaylist";
import useCollectionStaticRoutes from "@/components/collection/useCollectionStaticRoutes";
import { useAuth } from "@/providers/AuthProvider";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Text } from "@/components/ui/text";
import { useCallback, useMemo } from "react";
import { useUserPlaylistsQuery } from "@/api/users/userQueries";

const CollectionScreen = () => {
	const { user } = useAuth();
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const { bottomOffset, tabBarHeight } = useTheme();
	const staticRoutes = useCollectionStaticRoutes();
	const {
		data: playlists,
		fetchNextPage,
		refetch,
		hasNextPage,
	} = useUserPlaylistsQuery({
		userId: user?.id,
		filters: {
			sortBy: 'updated_at',
			sortOrder: 'desc',
		}
	});

	const combinedItems = useMemo(() => [
		...staticRoutes,
		...(playlists?.pages.flat() || []),
	], [staticRoutes, playlists]);

	const renderItem = useCallback(({ item } : { item: typeof combinedItems[number] }) => {
		if (item.type === 'static') {
			return (
				<Link href={item.href} style={tw`p-1`}>
					{item.icon}
					<View style={tw`w-full items-center`}>
						<Text>{item.label}</Text>
					</View>
				</Link>
			);
		} else if (item.type === 'tv_series' || item.type === 'movie') {
			return (
				<View style={tw`p-1`}>
					<CardPlaylist playlist={item} style={tw`w-full`} showPlaylistAuthor={false} showItemsCount />
				</View>
			);
		}
		return null;
	}, []);

	return (
		<LegendList
		data={combinedItems}
		renderItem={renderItem}
		onRefresh={refetch}
		numColumns={
			SCREEN_WIDTH < 360 ? 2 :
			SCREEN_WIDTH < 414 ? 3 :
			SCREEN_WIDTH < 600 ? 4 :
			SCREEN_WIDTH < 768 ? 5 : 6
		}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={(item) => (
			item.type === 'static' ? `static-${item.label}` : item.id.toString()
		)}
		maintainVisibleContentPosition={false}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionScreen;