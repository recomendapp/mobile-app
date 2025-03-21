import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useMediaMovieDetailsQuery, useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import tw from "@/lib/tw";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

const GRID_COLUMNS = 3;

const FilmPlaylistsScreen = () => {
	const { colors } = useTheme();
	const { i18n, t } = useTranslation();
	// const { film_id } = useLocalSearchParams();
	// const { id: movieId} = getIdFromSlug(film_id as string);
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
		id: 512, // movieId,
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
			{playlists?.pages[0].length ?
				<FlashList
				data={playlists.pages.flat()}
				renderItem={({ item, index }) => (
					<View key={index} style={tw.style('p-1')}>
						<CardPlaylist
						key={item.id}
						playlist={item}
						style={tw.style('w-full')}
						/>
					</View>
				)}
				keyExtractor={(_, index) => index.toString()}
				estimatedItemSize={190 * 15}
				refreshing={isFetching}
				numColumns={display === 'grid' ? GRID_COLUMNS : 1}
				onEndReached={() => hasNextPage && fetchNextPage()}
				onEndReachedThreshold={0.3}
				nestedScrollEnabled
				// ItemSeparatorComponent={() => <View className="w-2" />}
				/>
			: loading ? <Skeleton style={tw.style('h-48 w-full')} />
			: <ThemedText style={tw.style('text-center')}>{upperFirst(t('common.messages.no_results'))}</ThemedText>}
		</>
	)
};

export default FilmPlaylistsScreen;