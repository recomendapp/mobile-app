import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useFilmContext } from "@/components/screens/film/FilmContext";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaMovieDetailsQuery, useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useRoute } from "@react-navigation/native";
import { upperFirst } from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, { runOnJS, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle } from "react-native-reanimated";

const GRID_COLUMNS = 3;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const FilmPlaylistsScreen = () => {
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
	} = useFilmContext();
	const scrollRef = useAnimatedRef<Animated.FlatList<any>>();
	const bottomTabBarHeight = useBottomTabOverflow();
	const { showActionSheetWithOptions } = useActionSheet();
	const [display, setDisplay] = useState<'grid' | 'row'>('grid');
	const sortByOptions = [
		{ label: t('common.messages.updated_at'), value: 'updated_at' },
		{ label: t('common.messages.created_at'), value: 'created_at' },
		{ label: t('common.messages.likes_count'), value: 'likes_count' },
		{ label: t('common.word.cancel'), value: 'cancel' },
	];
	const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'likes_count'>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const {
		data: movie,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const {
		data: playlists,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
	} = useMediaPlaylistsInfiniteQuery({
		id: movie?.media_id,
		filters: {
			sortBy: sortBy,
			sortOrder: sortOrder,
			perPage: 20,
		}
	});

	const loading = isLoading || playlists === undefined;
	
	const handleSortBy = () => {
		const cancelIndex = sortByOptions.length - 1;
		showActionSheetWithOptions({
			options: sortByOptions.map((option) => upperFirst(option.label)),
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			setSortBy(sortByOptions[selectedIndex].value as 'updated_at' | 'created_at' | 'likes_count');
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

	useEffect(() => {
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
				minHeight: WINDOW_HEIGHT - (headerOverlayHeight.get() + tabBarHeight.get() + inset.top),
			},
		]}
		ListHeaderComponent={
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
		}
		ListEmptyComponent={
			loading ? <Icons.Loader /> :
			<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_results'))}
			</Text>
		}
		onScroll={scrollHandler}
		data={playlists?.pages.flat() || []}
		renderItem={({ item, index }) => (
			<View key={index} style={[tw`p-1`, { flex: 1 / GRID_COLUMNS }]}>
				<CardPlaylist
				key={item.id}
				playlist={item}
				style={tw.style('w-full')}
				/>
			</View>
		)}
		keyExtractor={(_, index) => index.toString()}
		refreshing={isFetching}
		numColumns={display === 'grid' ? GRID_COLUMNS : 1}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.1}
		nestedScrollEnabled
		showsVerticalScrollIndicator={false}
		/>
	)
};

export default FilmPlaylistsScreen;