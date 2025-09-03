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
import { useTranslations } from "use-intl";

const PlaylistItem = memo(({ item }: { item: Playlist }) => (
	<CardPlaylist variant="list" playlist={item} />
));
PlaylistItem.displayName = 'PlaylistItem';

const EmptyComponent = memo(({ 
	isLoading, 
	debouncedSearch,
	noResultsText 
}: { 
	isLoading: boolean; 
	debouncedSearch: string | null;
	noResultsText: string;
}) => {
	if (isLoading) return <Icons.Loader />;
	
	if (debouncedSearch) {
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
	const { inset, tabBarHeight } = useTheme();
	const t = useTranslations();
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchPlaylistsInfiniteQuery({
		query: debouncedSearch,
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

	const ListEmptyComponent = useCallback(() => (
		<EmptyComponent
			isLoading={isLoading}
			debouncedSearch={debouncedSearch}
			noResultsText={upperFirst(t('common.messages.no_results'))}
		/>
	), [isLoading, debouncedSearch, t]);

	useScrollToTop(scrollRef);

	return (
		<LegendList
			key={debouncedSearch}
			ref={scrollRef}
			data={playlistsData}
			renderItem={renderItem}
			contentContainerStyle={{
				paddingLeft: inset.left + PADDING_HORIZONTAL,
				paddingRight: inset.right + PADDING_HORIZONTAL,
				paddingBottom: tabBarHeight + inset.bottom + PADDING_VERTICAL,
				gap: GAP,
			}}
			keyExtractor={keyExtractor}
			ListEmptyComponent={ListEmptyComponent}
			onEndReached={onEndReached}
		/>
	);
});
SearchPlaylistsScreen.displayName = 'SearchPlaylistsScreen';

export default SearchPlaylistsScreen;