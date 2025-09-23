import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsSavedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Text, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { Icons } from "@/constants/Icons";
import { upperFirst } from "lodash";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslations } from "use-intl";
import { Playlist } from "@recomendapp/types";
import { useCallback } from "react";
import { PADDING_VERTICAL } from "@/theme/globals";

const CollectionSavedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { colors, bottomTabHeight, tabBarHeight } = useTheme();
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

	const renderItem = useCallback(({ item }: { item: { playlist: Playlist} }) => (
		<View style={tw`p-1`}>
			<CardPlaylist playlist={item.playlist} style={tw`w-full`} />
		</View>
	), []);
	const ListEmptyComponent = useCallback(() => {
		if (loading) {
			return <Icons.Loader />;
		}
		return (
			<View style={tw`flex-1 items-center justify-center p-4`}>
				<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
					{upperFirst(t('common.messages.no_playlists_saved'))}
				</Text>
			</View>
		);
	}, [loading, colors.mutedForeground, t]);
	const keyExtractor = useCallback((item: { playlist: Playlist }) => item.playlist.id.toString(), []);
	const onEndReached = useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage]);
	return (
		<LegendList
		data={playlists?.pages.flatMap((page) => page) ?? []}
		renderItem={renderItem}
		ListEmptyComponent={ListEmptyComponent}
		refreshing={isRefetching}
		onRefresh={refetch}
		numColumns={3}
		contentContainerStyle={{
			paddingBottom: bottomTabHeight + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={keyExtractor}
		showsVerticalScrollIndicator={false}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionSavedScreen;