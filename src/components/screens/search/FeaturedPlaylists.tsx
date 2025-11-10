import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useTheme } from "@/providers/ThemeProvider";
import { usePlaylistFeaturedInfiniteQuery } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { StyleProp, View, ViewStyle } from "react-native";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useCallback, useMemo, useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { Playlist } from "@recomendapp/types";
import { GAP, PADDING_VERTICAL } from "@/theme/globals";
import { Icons } from "@/constants/Icons";
import { Text } from "@/components/ui/text";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const GRID_COLUMNS = 3;
interface FeaturedPlaylistsProps {
	contentContainerStyle?: StyleProp<ViewStyle>;
}

const FeaturedPlaylists = ({
	contentContainerStyle,
} : FeaturedPlaylistsProps) => {
	const t = useTranslations();
	const { colors, bottomOffset } = useTheme();
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
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
				gap: GAP,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
			},
			contentContainerStyle,
		]}
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
		showsVerticalScrollIndicator={false}
		ItemSeparatorComponent={itemSeparator}
		onRefresh={refetch}
		keyboardShouldPersistTaps='always'
		/>
	)
};
FeaturedPlaylists.displayName = 'FeaturedPlaylists';

export default FeaturedPlaylists;