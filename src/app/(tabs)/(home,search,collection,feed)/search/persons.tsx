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

const SearchPersonsScreen = memo(() => {
	const insets = useSafeAreaInsets();
	const { tabBarHeight, bottomTabHeight} = useTheme();
	const t = useTranslations();
	const search = useSearchStore(state => state.search);
	
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchPersonsInfiniteQuery({
		query: search,
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

	useScrollToTop(scrollRef);

	return (
		<LegendList
			key={search}
			ref={scrollRef}
			data={personsData}
			renderItem={renderItem}
			contentContainerStyle={{
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
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
SearchPersonsScreen.displayName = 'SearchPersonsScreen';

export default SearchPersonsScreen;