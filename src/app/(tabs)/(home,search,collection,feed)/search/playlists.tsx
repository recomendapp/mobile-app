import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useSearchPlaylistsInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useScrollToTop } from "@react-navigation/native";
import { Playlist } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useRef, useCallback, useMemo, memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";

const PlaylistItem = memo(({ item }: { item: Playlist }) => (
	<CardPlaylist variant="list" playlist={item} />
));
PlaylistItem.displayName = 'PlaylistItem';

const EmptyComponent = memo(({ 
	isLoading, 
	search,
	noResultsText 
}: { 
	isLoading: boolean; 
	search: string | null;
	noResultsText: string;
}) => {
	if (isLoading) return <Icons.Loader />;
	
	if (search) {
		return (
			<View style={tw`flex-1 items-center justify-center`}>
				<Text textColor='muted'>{noResultsText}</Text>
			</View>
		);
	}
	
	return null;
});
EmptyComponent.displayName = 'EmptyComponent';

const SearchPlaylistsScreen = memo(() => {
	const insets = useSafeAreaInsets();
	const { tabBarHeight, bottomOffset } = useTheme();
	const t = useTranslations();
	const search = useSearchStore(state => state.search);
	
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchPlaylistsInfiniteQuery({
		query: search,
	});
	
	// REFs
	const scrollRef = useRef<LegendListRef>(null);
	
	// Memoized values
	const playlistsData = useMemo(() => 
		data?.pages.flatMap(page => page.data as Playlist[]) || [], 
		[data]
	);

	// Callbacks
	const renderItem = useCallback(({ item }: { item: Playlist }) => (
		<PlaylistItem item={item} />
	), []);

	const keyExtractor = useCallback((item: Playlist) => 
		item.id.toString(), 
		[]
	);

	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);

	useScrollToTop(scrollRef);

	return (
		<LegendList
			key={search}
			ref={scrollRef}
			data={playlistsData}
			renderItem={renderItem}
			contentContainerStyle={{
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
				gap: GAP,
			}}
			scrollIndicatorInsets={{
				bottom: tabBarHeight,
			}}
			keyExtractor={keyExtractor}
			ListEmptyComponent={
				<EmptyComponent
				isLoading={isLoading}
				search={search}
				noResultsText={upperFirst(t('common.messages.no_results'))}
				/>
			}
			onEndReached={onEndReached}
		/>
	);
});
SearchPlaylistsScreen.displayName = 'SearchPlaylistsScreen';

export default SearchPlaylistsScreen;