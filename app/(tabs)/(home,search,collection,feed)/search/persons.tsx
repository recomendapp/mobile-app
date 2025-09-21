import { CardPerson } from "@/components/cards/CardPerson";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useSearchPersonsInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useScrollToTop } from "@react-navigation/native";
import { MediaPerson } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useRef, useCallback, useMemo, memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";

const PersonItem = memo(({ item }: { item: MediaPerson }) => (
	<CardPerson variant="list" person={item} />
));
PersonItem.displayName = 'PersonItem';

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

const SearchPersonsScreen = memo(() => {
	const insets = useSafeAreaInsets();
	const { tabBarHeight } = useTheme();
	const t = useTranslations();
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchPersonsInfiniteQuery({
		query: debouncedSearch,
	});
	
	// REFs
	const scrollRef = useRef<LegendListRef>(null);
	
	// Memoized values
	const personsData = useMemo(() => 
		data?.pages.flatMap(page => page.data as MediaPerson[]) || [], 
		[data]
	);

	// Callbacks
	const renderItem = useCallback(({ item }: { item: MediaPerson }) => (
		<PersonItem item={item} />
	), []);

	const keyExtractor = useCallback((item: MediaPerson) => 
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
			data={personsData}
			renderItem={renderItem}
			contentContainerStyle={{
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: tabBarHeight + insets.bottom + PADDING_VERTICAL,
				gap: GAP,
			}}
			keyExtractor={keyExtractor}
			ListEmptyComponent={ListEmptyComponent}
			onEndReached={onEndReached}
		/>
	);
});
SearchPersonsScreen.displayName = 'SearchPersonsScreen';

export default SearchPersonsScreen;