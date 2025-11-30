import { CardMovie } from "@/components/cards/CardMovie";
import { Text } from "@/components/ui/text";
import TrueSheet from "@/components/ui/TrueSheet";
import { TrueSheet as RNTrueSheet } from "@lodev09/react-native-true-sheet";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useScrollToTop } from "@react-navigation/native";
// import { useNavigation } from "expo-router";
import { upperFirst } from "lodash";
import { useRef, forwardRef } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { MediaMovie } from "@recomendapp/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchMoviesOptions } from "@/api/options";
import ErrorMessage from "@/components/ErrorMessage";

const FiltersSheet = forwardRef<RNTrueSheet>((_, ref) => {
	const insets = useSafeAreaInsets();
	const t = useTranslations();
	const filtersScrollViewRef = useRef<ScrollView>(null);

	return (
		<TrueSheet
			ref={ref}
			sizes={['auto']}
			scrollRef={filtersScrollViewRef as React.RefObject<React.Component>}
		>
			<ScrollView
				ref={filtersScrollViewRef}
				bounces={false}
				contentContainerStyle={{
					paddingTop: PADDING_VERTICAL,
					paddingLeft: insets.left + PADDING_HORIZONTAL,
					paddingRight: insets.right + PADDING_HORIZONTAL,
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
		</TrueSheet>
	);
});
FiltersSheet.displayName = 'FiltersSheet';

const SearchFilmsScreen = () => {
	const insets = useSafeAreaInsets();
	const { tabBarHeight, bottomOffset } = useTheme();
	// const navigation = useNavigation();
	const t = useTranslations();
	const search = useSearchStore(state => state.search);
	
	// States
	// const [runtimeFilter, setRuntimeFilter] = useState<{ min?: number; max?: number }>({ 
	// 	min: undefined, 
	// 	max: undefined 
	// });
	
	// Queries
	const {
		data,
		isLoading,
		isError,
		hasNextPage,
		fetchNextPage,
		refetch,
		isRefetching,
	} = useInfiniteQuery(useSearchMoviesOptions({
		query: search,
	}));
	
	// REFs
	const scrollRef = useRef<LegendListRef>(null);
	// const filtersRef = useRef<TrueSheet>(null);

	// const handleFiltersPress = () => {
	// 	filtersRef.current?.present();
	// };
	
	useScrollToTop(scrollRef);
	
	// useLayoutEffect(() => {
	// 	navigation.getParent()?.setOptions({
	// 		headerRight: () => <FiltersButton onPress={handleFiltersPress} />
	// 	});

	// 	return () => {
	// 		navigation.getParent()?.setOptions({
	// 			headerRight: undefined,
	// 		});
	// 	};
	// }, [navigation, handleFiltersPress]);

	return (
		<>
			<LegendList
			key={search}
			ref={scrollRef}
			data={data?.pages.flatMap(page => page.data) as MediaMovie[] || []}
			renderItem={({ item }) => <CardMovie variant="list" movie={item} /> }
			contentContainerStyle={{
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
				gap: GAP,
			}}
			scrollIndicatorInsets={{
				bottom: tabBarHeight,
			}}
			keyExtractor={(item) => item.id.toString()}
			ListEmptyComponent={
				isError ? <ErrorMessage />
				: isLoading ? <Icons.Loader />
				: (
					<View style={tw`flex-1 items-center justify-center`}>
						<Text textColor='muted'>
							{search.length ? upperFirst(t('common.messages.no_results')) : upperFirst(t('common.messages.start_typing_to_search_films'))}
						</Text>
					</View>
				)
			}
			onRefresh={refetch}
			refreshing={isRefetching}
			onEndReached={() => hasNextPage && fetchNextPage()}
			/>
			{/* <FiltersSheet ref={filtersRef} /> */}
		</>
	);
};
SearchFilmsScreen.displayName = 'SearchFilmsScreen';

export default SearchFilmsScreen;