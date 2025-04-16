import React from "react";
import { CardReview } from "@/components/cards/CardReview";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useMediaMovieDetailsQuery, useMediaReviewsInfiniteQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { upperFirst } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, View } from "react-native";
import Animated, { runOnJS, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle } from "react-native-reanimated";
import { useFilmStore } from "@/stores/useFilmStore";
import ButtonMyReview from "@/components/buttons/ButtonMyReview";
import { useRoute } from "@react-navigation/native";

const GRID_COLUMNS = 1;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const FilmReviewsScreen = () => {
	const { colors, inset } = useTheme();
	const { i18n, t } = useTranslation();
	const route = useRoute();
	const {
		tabState,
		movieId,
		syncScrollOffset,
		scrollY,
		headerHeight,
		tabBarHeight,
		headerOverlayHeight,
		addScrollRef 
	} = useFilmStore();
	const scrollRef = useAnimatedRef<Animated.FlatList<any>>();
	const bottomTabBarHeight = useBottomTabOverflow();
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
		onMomentumEnd: event => {
			'worklet';
			runOnJS(syncScrollOffset)();
		},
		onEndDrag: event => {
			'worklet';
			runOnJS(syncScrollOffset)();
		}
	});

	const flatlistStyle = useAnimatedStyle(() => ({
		paddingTop: headerHeight.get() + tabBarHeight.get(),
	}));

	React.useEffect(() => {
		if (scrollRef.current && tabState) {
			addScrollRef(route.key, scrollRef);
		}
	}, [scrollRef, tabState]);

	return (
		<Animated.FlatList
		ref={scrollRef}
		style={flatlistStyle}
		contentContainerStyle={[
			tw`pt-2 px-2`,
			{
				paddingBottom: bottomTabBarHeight + inset.bottom,
				minHeight: WINDOW_HEIGHT - (headerOverlayHeight.get() + tabBarHeight.get() + inset.top)
			},
		]}
		ListHeaderComponent={() => (
			<View style={tw`flex-row justify-between items-center gap-2`}>
				<ButtonMyReview mediaId={movie?.media_id!} />
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
		refreshing={isFetching}
		numColumns={display === 'grid' ? GRID_COLUMNS : 1}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		showsVerticalScrollIndicator={false}
		ItemSeparatorComponent={() => <View className="w-2" />}
		/>
	);
};

export default FilmReviewsScreen;