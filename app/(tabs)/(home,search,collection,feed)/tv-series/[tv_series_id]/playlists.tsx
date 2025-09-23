import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { upperFirst } from "lodash";
import { useAuth } from "@/providers/AuthProvider";
import { Text, View } from "react-native";
import { useMediaPlaylistsTvSeriesInfiniteQuery, useMediaTvSeriesQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { ButtonPlaylistTvSeriesAdd } from "@/components/buttons/ButtonPlaylistTvSeriesAdd";
import { FadeInDown } from "react-native-reanimated";
import { Playlist } from "@recomendapp/types";

interface sortBy {
	label: string;
	value: 'updated_at' | 'created_at' | 'likes_count';
}

const TvSeriesPlaylists = () => {
	const t = useTranslations();
	const { session } = useAuth();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { colors, tabBarHeight, bottomTabHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions = useMemo((): sortBy[] => [
		{ label: upperFirst(t('common.messages.date_updated')), value: 'updated_at' },
		{ label: upperFirst(t('common.messages.date_created')), value: 'created_at' },
		{ label: upperFirst(t('common.messages.number_of_likes')), value: 'likes_count' },
	], [t]);
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	// Requests
	const { data: tvSeries } = useMediaTvSeriesQuery({ tvSeriesId: seriesId });
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaPlaylistsTvSeriesInfiniteQuery({
		tvSeriesId: seriesId,
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
	}, [sortByOptions, showActionSheetWithOptions]);

	const handleSortOrderToggle = useCallback(() => {
		setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
	}, []);


	return (
	<>
		<Stack.Screen
		options={useMemo(() => ({
			title: tvSeries?.name || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.playlist', { count: 2 }))}</HeaderTitle>,
			headerRight: (session && tvSeries) ? () => (
				<ButtonPlaylistTvSeriesAdd tvSeries={tvSeries} />
			) : undefined,
		}), [tvSeries?.name, session, t])}
		/>
		<LegendList
		data={playlists}
		renderItem={useCallback(({ item } : { item: Playlist }) => (
			<CardPlaylist
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
		ListEmptyComponent={ useMemo(() => {
			if (loading) return <Icons.Loader />;
			return (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			);
		}, [loading, colors.mutedForeground, t])}
		numColumns={3}
		onEndReached={useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage])}
		onEndReachedThreshold={0.5}
		contentContainerStyle={{
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
				gap: GAP,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={useCallback((item: Playlist) => item.id.toString(), [])}
		columnWrapperStyle={tw`gap-2`}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default TvSeriesPlaylists;