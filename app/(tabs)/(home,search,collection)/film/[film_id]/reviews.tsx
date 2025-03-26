import { CardReview } from "@/components/cards/CardReview";
import { useFilmContext } from "@/components/screens/film/FilmContext";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useMediaMovieDetailsQuery, useMediaReviewsInfiniteQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { FlashList } from "@shopify/flash-list";
import { upperFirst } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, View } from "react-native";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

const GRID_COLUMNS = 1;

const FilmReviewsScreen = () => {
	const { colors, inset } = useTheme();
	const { i18n, t } = useTranslation();
	const { tabState, movieId, scrollY, headerHeight, addScrollRef } = useFilmContext();
	const tabBarHeight = useBottomTabOverflow();
	const { showActionSheetWithOptions } = useActionSheet();
	const [display, setDisplay] = useState<'grid' | 'row'>('grid');
	const sortByOptions = [
		{ label: t('common.messages.updated_at'), value: 'updated_at' },
		{ label: t('common.word.cancel'), value: 'cancel' },
	];
	const [sortBy, setSortBy] = useState<'updated_at'>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const {
		data: movie,
	} = useMediaMovieDetailsQuery({
		id: movieId, // movieId
		locale: i18n.language,
	});
	const {
		data: reviews,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
	} = useMediaReviewsInfiniteQuery({
		id: movie?.media_id,
		filters: {
			sortBy: sortBy,
			sortOrder: sortOrder,
			perPage: 10,
		}
	});

	const loading = isLoading || reviews === undefined;
	
	const handleSortBy = () => {
		const cancelIndex = sortByOptions.length - 1;
		showActionSheetWithOptions({
			options: sortByOptions.map((option) => upperFirst(option.label)),
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			setSortBy(sortByOptions[selectedIndex].value as 'updated_at');
		});
	};

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});

	return (
		<Animated.FlatList
		ref={(ref) => {
			if (ref) {
			  addScrollRef('reviews', ref); // ref est déjà une AnimatedRef avec Reanimated
			}
		}}
		ListHeaderComponent={() => (
			<View>
				<View style={tw.style('flex flex-row justify-end items-center gap-2')}>
					<Pressable onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}>
					{sortOrder === 'desc' ? <Icons.ArrowDownNarrowWide color={colors.foreground} size={20} /> : <Icons.ArrowUpNarrowWide color={colors.foreground} size={20} />}
					</Pressable>
					<Pressable onPress={handleSortBy} style={tw.style('flex-row items-center gap-1')}>
						<ThemedText>{upperFirst(t(`common.messages.${sortBy}`))}</ThemedText>
						<Icons.ChevronDown color={colors.foreground} size={20} />
					</Pressable>
				</View>
			</View>
		)}
		ListEmptyComponent={() => !loading ? <ThemedText style={tw.style('text-center')}>{upperFirst(t('common.messages.no_results'))}</ThemedText> : null}
		onScroll={scrollHandler}
		contentContainerStyle={{
			paddingTop: headerHeight.get(),
			paddingBottom: tabBarHeight + inset.bottom,
			minHeight: Dimensions.get('window').height + headerHeight.get(),
		}}
		data={reviews?.pages.flat()}
		renderItem={({ item, index }) => (
			<CardReview
			key={index}
			review={item}
			activity={item.activity}
			author={item.activity?.user}
			/>
		)}
		keyExtractor={(_, index) => index.toString()}
		// estimatedItemSize={190 * 15}
		refreshing={isFetching}
		numColumns={display === 'grid' ? GRID_COLUMNS : 1}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		ItemSeparatorComponent={() => <View className="w-2" />}
		// ItemSeparatorComponent={() => <View className="w-2" />}
		/>
	)

	return (
		<>
			<View>
				<View style={tw.style('flex flex-row justify-end items-center gap-2')}>
					<Pressable onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}>
					{sortOrder === 'desc' ? <Icons.ArrowDownNarrowWide color={colors.foreground} size={20} /> : <Icons.ArrowUpNarrowWide color={colors.foreground} size={20} />}
					</Pressable>
					<Pressable onPress={handleSortBy} style={tw.style('flex-row items-center gap-1')}>
						<ThemedText>{upperFirst(t(`common.messages.${sortBy}`))}</ThemedText>
						<Icons.ChevronDown color={colors.foreground} size={20} />
					</Pressable>
				</View>
			</View>
			{reviews?.pages[0].length ?
				<FlashList
				data={reviews.pages.flat()}
				renderItem={({ item, index }) => (
					<CardReview
					key={index}
					review={item}
					activity={item.activity}
					author={item.activity?.user}
					/>
				)}
				keyExtractor={(_, index) => index.toString()}
				estimatedItemSize={190 * 15}
				refreshing={isFetching}
				numColumns={display === 'grid' ? GRID_COLUMNS : 1}
				onEndReached={() => hasNextPage && fetchNextPage()}
				onEndReachedThreshold={0.3}
				nestedScrollEnabled
				ItemSeparatorComponent={() => <View className="w-2" />}
				/>
			: loading ? <Skeleton style={tw.style('h-48 w-full')} />
			: <ThemedText style={tw.style('text-center')}>{upperFirst(t('common.messages.no_results'))}</ThemedText>}
		</>
	)
};

export default FilmReviewsScreen;