import { CardPlaylist } from "@/components/cards/CardPlaylist";
import useCollectionStaticRoutes, { CollectionStaticRoute } from "@/components/screens/collection/useCollectionStaticRoutes";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { useTheme } from "@/providers/ThemeProvider";
import { useCallback, useMemo } from "react";
import { Playlist } from "@recomendapp/types";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";

const CollectionScreen = () => {
	const { user } = useAuth();
	const { bottomTabHeight, tabBarHeight } = useTheme();
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

	const combinedItems = useMemo(() => [
		...staticRoutes,
		...(playlists?.pages.flatMap((page) => page) ?? []),
	], [staticRoutes, playlists]);

	const renderItem = useCallback(({ item } : { item: CollectionStaticRoute | Playlist }) => {
		switch (item.type) {
			case 'static':
				return (
					<Link href={item.href} style={tw`p-1`}>
						{item.icon}
						<View style={tw`w-full items-center`}>
							<ThemedText>{item.label}</ThemedText>
						</View>
					</Link>
				);
			case 'tv_series':
			case 'movie':
				return (
					<View style={tw`p-1`}>
						<CardPlaylist playlist={item} style={tw`w-full`} showPlaylistAuthor={false} showItemsCount />
					</View>
				);
			default:
				return null;
		}
	}, [staticRoutes, playlists]);
	const keyExtractor = useCallback((item: CollectionStaticRoute | Playlist, index: number) => {
		if (item.type === 'static') return `static-${item.label}`;
		return item.id.toString();
	}, []);
	const onEndReached = useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage]);
	return (
		<LegendList
		data={combinedItems}
		renderItem={renderItem}
		refreshing={isRefetching}
		onRefresh={refetch}
		numColumns={3}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: bottomTabHeight + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={keyExtractor}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionScreen;