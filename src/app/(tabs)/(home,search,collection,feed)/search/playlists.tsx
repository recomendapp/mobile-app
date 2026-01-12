import { useSearchPlaylistsQuery } from "@/api/search/searchQueries";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import ErrorMessage from "@/components/ErrorMessage";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useScrollToTop } from "@react-navigation/native";
import { Playlist } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useRef } from "react";
import { useKeyboardState } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";

const SearchPlaylistsScreen = () => {
	const insets = useSafeAreaInsets();
	const { bottomOffset, tabBarHeight } = useTheme();
	const {
		isVisible: keyboardVisible,
		height: keyboardHeight,
	} = useKeyboardState((state) => state);
	const t = useTranslations();
	const search = useSearchStore(state => state.search);
	
	// Queries
	const {
		data,
		isLoading,
		isError,
		hasNextPage,
		fetchNextPage,
		refetch,
		isRefetching,
	} = useSearchPlaylistsQuery({
		query: search,
	});
	
	// REFs
	const scrollRef = useRef<LegendListRef>(null);

	useScrollToTop(scrollRef);

	return (
		<LegendList
			key={search}
			ref={scrollRef}
			data={data?.pages.flatMap(page => page.data) as Playlist[] || []}
			renderItem={({ item }) => <CardPlaylist variant="list" playlist={item} /> }
			contentContainerStyle={{
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: keyboardVisible ? keyboardHeight + PADDING_VERTICAL : bottomOffset + PADDING_VERTICAL,
				gap: GAP,
			}}
			scrollIndicatorInsets={{
				bottom: keyboardVisible ? (keyboardHeight - insets.bottom) : tabBarHeight,
			}}
			keyExtractor={(item) => item.id.toString()}
			ListEmptyComponent={
				isError ? <ErrorMessage />
				: isLoading ? <Icons.Loader />
				: (
					<View style={tw`flex-1 items-center justify-center`}>
						<Text textColor='muted'>
							{search.length ? upperFirst(t('common.messages.no_results')) : upperFirst(t('common.messages.start_typing_to_search_playlists'))}
						</Text>
					</View>
				)
			}
			keyboardShouldPersistTaps="handled"
			onRefresh={refetch}
			refreshing={isRefetching}
			onEndReached={() => hasNextPage && fetchNextPage()}
		/>
	);
};

export default SearchPlaylistsScreen;