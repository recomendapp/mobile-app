import { CardMovie } from "@/components/cards/CardMovie";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import ThemedTrueSheet from "@/components/ui/ThemedTrueSheet";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useSearchMoviesInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList, LegendListRef } from "@legendapp/list";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useScrollToTop } from "@react-navigation/native";
import { MediaMovie } from "@recomendapp/types";
import { useNavigation } from "expo-router";
import { upperFirst } from "lodash";
import { useLayoutEffect, useRef, useState, useCallback, useMemo, memo, forwardRef } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const FiltersButton = memo(({ onPress }: { onPress: () => void }) => {

	return (
		<View
		style={[
			tw`flex-row items-center`, 
			{ gap: GAP }
		]}
		>
			<Button
				variant="ghost"
				icon={Icons.Filters}
				size="icon"
				onPress={onPress}
			/>
		</View>
	);
});
FiltersButton.displayName = 'FiltersButton';

const MovieItem = memo(({ item }: { item: MediaMovie }) => (
	<CardMovie variant="list" movie={item} />
));
MovieItem.displayName = 'MovieItem';

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

const FiltersSheet = memo(forwardRef<TrueSheet>((_, ref) => {
	const { inset } = useTheme();
	const t = useTranslations();
	const filtersScrollViewRef = useRef<ScrollView>(null);

	return (
		<ThemedTrueSheet
			ref={ref}
			sizes={['auto']}
			scrollRef={filtersScrollViewRef as React.RefObject<React.Component<unknown, {}, any>>}
		>
			<ScrollView
				ref={filtersScrollViewRef}
				bounces={false}
				contentContainerStyle={{
					paddingTop: PADDING_VERTICAL,
					paddingLeft: inset.left + PADDING_HORIZONTAL,
					paddingRight: inset.right + PADDING_HORIZONTAL,
					backgroundColor: 'red', // TODO: Remove debug style
				}}
			>
				<Text>Filters MOVIES</Text>
				<View>
					<Text>{upperFirst(t('common.messages.runtime'))}</Text>
				</View>
				<View>
					<Text>{upperFirst(t('common.messages.release_date'))}</Text>
				</View>
			</ScrollView>
		</ThemedTrueSheet>
	);
}));
FiltersSheet.displayName = 'FiltersSheet';

const SearchFilmsScreen = memo(() => {
	const { inset, tabBarHeight } = useTheme();
	const navigation = useNavigation();
	const t = useTranslations();
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	
	// States
	const [runtimeFilter, setRuntimeFilter] = useState<{ min?: number; max?: number }>({ 
		min: undefined, 
		max: undefined 
	});
	
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchMoviesInfiniteQuery({
		query: debouncedSearch,
	});
	
	// REFs
	const scrollRef = useRef<LegendListRef>(null);
	const filtersRef = useRef<TrueSheet>(null);
	
	// Memoized values
	const moviesData = useMemo(() => 
		data?.pages.flatMap(page => page.data as MediaMovie[]) || [], 
		[data]
	);

	// Callbacks
	const renderItem = useCallback(({ item }: { item: MediaMovie }) => (
		<MovieItem item={item} />
	), []);

	const keyExtractor = useCallback((item: MediaMovie) => 
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

	const handleFiltersPress = useCallback(() => {
		filtersRef.current?.present();
	}, []);
	
	useScrollToTop(scrollRef);
	
	useLayoutEffect(() => {
		navigation.getParent()?.setOptions({
			headerRight: () => <FiltersButton onPress={handleFiltersPress} />
		});

		return () => {
			navigation.getParent()?.setOptions({
				headerRight: undefined,
			});
		};
	}, [navigation, handleFiltersPress]);

	return (
		<>
			<LegendList
				key={debouncedSearch}
				ref={scrollRef}
				data={moviesData}
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
			<FiltersSheet ref={filtersRef} />
		</>
	);
});
SearchFilmsScreen.displayName = 'SearchFilmsScreen';

export default SearchFilmsScreen;