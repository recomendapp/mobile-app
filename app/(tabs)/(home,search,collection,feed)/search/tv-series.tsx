import { CardTvSeries } from "@/components/cards/CardTvSeries";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import ThemedTrueSheet from "@/components/ui/ThemedTrueSheet";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useSearchTvSeriesInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { MediaTvSeries } from "@recomendapp/types";
import { useNavigation } from "expo-router";
import { upperFirst } from "lodash";
import { useLayoutEffect, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const SearchTvSeriesScreen = () => {
	const { inset, tabBarHeight } = useTheme();
	const navigation = useNavigation();
	const t = useTranslations();
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchTvSeriesInfiniteQuery({
		query: debouncedSearch,
	});
	// REFs
	const filtersRef = useRef<TrueSheet>(null);
	const filtersScrollViewRef = useRef<ScrollView>(null);

	useLayoutEffect(() => {
		navigation.getParent()?.setOptions({
			headerRight: () => (
				<View style={[tw`flex-row items-center`, { gap: GAP }]}>
					<Button
					variant="ghost"
					icon={Icons.Filters}
					size="icon"
					onPress={() => filtersRef.current?.present()}
					/>
				</View>
			)
		});

		return () => {
			navigation.getParent()?.setOptions({
				headerRight: undefined,
			});
		};
	}, [navigation, t]);

	return (
	<>
		<LegendList
		data={data?.pages.flatMap(page => page.data) || []}
		renderItem={({ item }) => (
			<CardTvSeries variant="list" tvSeries={item as MediaTvSeries} />
		)}
		contentContainerStyle={{
			paddingLeft: inset.left + PADDING_HORIZONTAL,
			paddingRight: inset.right + PADDING_HORIZONTAL,
			paddingBottom: tabBarHeight + inset.bottom + PADDING_VERTICAL,
			gap: GAP,
		}}
		keyExtractor={(item) => item.id.toString()}
		ListEmptyComponent={
			isLoading ? <Icons.Loader /> : debouncedSearch ? (
				<View style={tw`flex-1 items-center justify-center`}>
					<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
				</View>
			) : null
		}
		onEndReached={() => hasNextPage && fetchNextPage()}
		/>
		<ThemedTrueSheet
		ref={filtersRef}
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
				backgroundColor: 'red',
			}}
			>
				<Text>Filters TV SERIES</Text>
				<View>
					<Text>{upperFirst(t('common.messages.runtime'))}</Text>
				</View>
				<View>
					<Text>{upperFirst(t('common.messages.release_date'))}</Text>
				</View>
			</ScrollView>
		</ThemedTrueSheet>
	</>
	)
};

export default SearchTvSeriesScreen;