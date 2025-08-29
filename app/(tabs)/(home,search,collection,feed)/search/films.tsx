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
import { useLayoutEffect, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const SearchFilmsScreen = () => {
	const { inset, tabBarHeight } = useTheme();
	const navigation = useNavigation();
	const t = useTranslations();
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	// States
	const [runtimeFilter, setRuntimeFilter] = useState<{ min?: number; max?: number }>({ min: undefined, max: undefined });
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
	const filtersScrollViewRef = useRef<ScrollView>(null);
	
	useScrollToTop(scrollRef);
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
		key={debouncedSearch}
		ref={scrollRef}
		data={data?.pages.flatMap(page => page.data) || []}
		renderItem={({ item }) => (
			<CardMovie variant="list" movie={item as MediaMovie} />
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
				<Text>Filters MOVIES</Text>
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

export default SearchFilmsScreen;