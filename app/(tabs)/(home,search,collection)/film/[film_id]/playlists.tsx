import { CardPlaylist } from "@/components/cards/CardPlaylist";
import FilmNav from "@/components/screens/film/FilmNav";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useMediaMovieDetailsQuery, useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import tw from "@/lib/tw";
import { useFilmStore } from "@/stores/filmStore";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList)

const GRID_COLUMNS = 3;

const FilmPlaylistsScreen = () => {
	const { colors } = useTheme();
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { sv, headerHeight, filmHeaderHeight } = useFilmStore();
	const { id: movieId} = getIdFromSlug(film_id as string);
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
			perPage: GRID_COLUMNS * 5,
		}
	});

	const loading = isLoading || playlists === undefined;
	
	const inset = useSafeAreaInsets();
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

	const stickyElement = useAnimatedStyle(() => {
		return {
		transform: [
			{
			translateY: interpolate(
				sv.get(),
				[
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) - 1,
				filmHeaderHeight.get() - (headerHeight.get() + inset.top),
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[0, 0, 1],
			),
			},
		],
		};
	});

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			sv.value = event.contentOffset.y;
		},
	});

	return (
		<AnimatedFlashList
		ListHeaderComponent={() => (
			<>
				<ThemedAnimatedView
				style={[
					tw.style('w-full items-center justify-center z-10 p-2'),
					stickyElement
				]}
				>
					<FilmNav slug={String(film_id)} />
				</ThemedAnimatedView>
				<View style={tw.style('flex flex-row justify-end items-center gap-2')}>
					<Pressable onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}>
					{sortOrder === 'desc' ? <Icons.ArrowDownNarrowWide color={colors.foreground} size={20} /> : <Icons.ArrowUpNarrowWide color={colors.foreground} size={20} />}
					</Pressable>
					<Pressable onPress={handleSortBy} style={tw.style('flex-row items-center gap-1')}>
						<ThemedText>{upperFirst(t(`common.messages.${sortBy}`))}</ThemedText>
						<Icons.ChevronDown color={colors.foreground} size={20} />
					</Pressable>
				</View>
			</>
		)}
		data={playlists?.pages.flat()}
		renderItem={({ item, index } : { item: any, index: number }) => (
			<View key={index} style={tw.style('p-1')}>
					<CardPlaylist
					key={item.id}
					playlist={item}
					style={tw.style('w-full')}
					/>
			</View>
		)}
		contentContainerStyle={{
			paddingTop: filmHeaderHeight.get(),
		}}
		ListEmptyComponent={() => loading ? <Skeleton style={tw.style('h-48 w-full')} /> : <ThemedText style={tw.style('text-center')}>{upperFirst(t('common.messages.no_results'))}</ThemedText>}
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={190 * 15}
		onScroll={scrollHandler}
		refreshing={isFetching}
		numColumns={display === 'grid' ? GRID_COLUMNS : 1}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.2}
		nestedScrollEnabled
		/>
	)
};

export default FilmPlaylistsScreen;