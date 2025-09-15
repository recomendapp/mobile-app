import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import {  useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { upperFirst } from "lodash";
import { useAuth } from "@/providers/AuthProvider";
import { Text, View } from "react-native";
import { useMediaMovieQuery, useMediaPlaylistsMovieInfiniteQuery, useMediaReviewsTvSeriesInfiniteQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_VERTICAL } from "@/theme/globals";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useCallback, useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { ButtonPlaylistMovieAdd } from "@/components/buttons/ButtonPlaylistMovieAdd";
import { FadeInDown } from "react-native-reanimated";
import { Playlist } from "@recomendapp/types";

interface sortBy {
	label: string;
	value: 'updated_at' | 'created_at' | 'likes_count';
}

const FilmPlaylists = () => {
	const t = useTranslations();
	const { session } = useAuth();
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { colors, bottomTabHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions: sortBy[] = useMemo(() => [
		{ label: upperFirst(t('common.messages.date_updated')), value: 'updated_at' },
		{ label: upperFirst(t('common.messages.date_created')), value: 'created_at' },
		{ label: upperFirst(t('common.messages.number_of_likes')), value: 'likes_count' },
	], [t]);
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	// Requests
	const { data: movie } = useMediaMovieQuery({ movieId: movieId });
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaPlaylistsMovieInfiniteQuery({
		movieId: movieId,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = data === undefined || isLoading;
	const playlists = useMemo(() => data?.pages.flat() || [], [data]);
	// Handlers
	const handleSortBy = useCallback(() => {
		const sortByOptionsWithCancel = [
			...sortByOptions,
			{ label: upperFirst(t('common.messages.cancel')), value: 'cancel' },
		];
		const cancelIndex = sortByOptionsWithCancel.length - 1;
		showActionSheetWithOptions({
			options: sortByOptionsWithCancel.map((option) => option.label),
			disabledButtonIndices: sortByOptions ? [sortByOptionsWithCancel.findIndex(option => option.value === sortBy.value)] : [],
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			setSortBy(sortByOptionsWithCancel[selectedIndex] as sortBy);
		});
	}, [sortByOptions, showActionSheetWithOptions, t, sortBy.value]);

	const handleSortOrderToggle = useCallback(() => {
		setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
	}, []);

	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);

	return (
	<>
		<Stack.Screen
		options={useMemo(() => ({
			title: movie?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.playlist', { count: 2 }))}</HeaderTitle>,
			headerRight: (session && movie) ? () => (
				<ButtonPlaylistMovieAdd movie={movie} />
			) : undefined,
		}), [movie?.title, session, t])}
		/>
		<LegendList
		data={playlists}
		renderItem={useCallback(({ item } : { item: Playlist }) => (
			<CardPlaylist
			key={item.id}
			playlist={item}
			entering={FadeInDown}
			/>
		), [])}
		ListHeaderComponent={useMemo(() => (
			<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
				<Button
				icon={sortOrder === 'desc' ? Icons.ArrowDownNarrowWide : Icons.ArrowUpNarrowWide}
				variant="muted"
				size='icon'
				onPress={handleSortOrderToggle}
				/>
				<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>
					{sortBy.label}
				</Button>
			</View>
		), [sortOrder, sortBy.label, handleSortOrderToggle, handleSortBy])}
		ListEmptyComponent={useMemo(() => 
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			), [loading, colors.mutedForeground, t]
		)}
		numColumns={3}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.5}
		contentContainerStyle={useMemo(() => [
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
			},
			tw`px-4`,
		], [bottomTabHeight])}
		keyExtractor={useCallback((item: any) => item.id.toString(), [])}
		columnWrapperStyle={useMemo(() => tw`gap-2`, [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

FilmPlaylists.displayName = 'FilmPlaylists';

export default FilmPlaylists;