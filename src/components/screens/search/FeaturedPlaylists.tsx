import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { StyleProp, useWindowDimensions, View, ViewStyle } from "react-native";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useCallback, useMemo, useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { Playlist } from "@recomendapp/types";
import { GAP, PADDING_VERTICAL } from "@/theme/globals";
import { Icons } from "@/constants/Icons";
import { Text } from "@/components/ui/text";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePlaylistsFeaturedQuery } from "@/api/playlists/playlistQueries";

interface FeaturedPlaylistsProps {
	contentContainerStyle?: StyleProp<ViewStyle>;
}

const FeaturedPlaylists = ({
	contentContainerStyle,
} : FeaturedPlaylistsProps) => {
	const t = useTranslations();
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = usePlaylistsFeaturedQuery({
		filters: {
			sortBy: 'updated_at',
			sortOrder: 'desc',
		}
	});
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
		numColumns={
			SCREEN_WIDTH < 360 ? 2 :
			SCREEN_WIDTH < 414 ? 3 :
			SCREEN_WIDTH < 600 ? 4 :
			SCREEN_WIDTH < 768 ? 5 : 6
		}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		contentContainerStyle={[
			{
				gap: GAP,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
			},
			contentContainerStyle,
		]}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		ListEmptyComponent={
			isLoading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			)
		}
		keyExtractor={keyExtractor}
		ItemSeparatorComponent={itemSeparator}
		onRefresh={refetch}
		keyboardShouldPersistTaps='always'
		/>
	)
};
FeaturedPlaylists.displayName = 'FeaturedPlaylists';

export default FeaturedPlaylists;