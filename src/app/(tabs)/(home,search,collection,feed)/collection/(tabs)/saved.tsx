import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useAuth } from "@/providers/AuthProvider";
import tw from "@/lib/tw";
import { Text, useWindowDimensions, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { Icons } from "@/constants/Icons";
import { upperFirst } from "lodash";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslations } from "use-intl";
import { Playlist } from "@recomendapp/types";
import { useCallback, useMemo } from "react";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useUserPlaylistsSavedQuery } from "@/api/users/userQueries";

const CollectionSavedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const {
		data,
		isLoading,
		fetchNextPage,
		refetch,
		hasNextPage,
	} = useUserPlaylistsSavedQuery({
		userId: user?.id,
	});
	const loading = isLoading || data === undefined;
	const playlists = useMemo(() => data?.pages.flat() ?? [], [data]);

	const renderItem = useCallback(({ item }: { item: { playlist: Playlist} }) => (
		<View style={tw`p-1`}>
			<CardPlaylist playlist={item.playlist} style={tw`w-full`} />
		</View>
	), []);
	const keyExtractor = useCallback((item: { playlist: Playlist }) => item.playlist.id.toString(), []);
	const onEndReached = useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage]);
	return (
		<LegendList
		data={playlists}
		renderItem={renderItem}
		ListEmptyComponent={
			loading ? <Icons.Loader /> : (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_playlists_saved'))}
					</Text>
				</View>
			)
		}
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
		maintainVisibleContentPosition={false}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={keyExtractor}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionSavedScreen;