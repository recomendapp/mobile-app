import { Text, View } from "react-native";
import { useMediaReviewsTvSeriesInfiniteQuery, useMediaTvSeriesQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import ButtonMyReviewTvSeries from "@/components/buttons/ButtonMyReviewTvSeries";
import { CardReviewTvSeries } from "@/components/cards/reviews/CardReviewTvSeries";
import { UserReviewTvSeries } from "@recomendapp/types";

interface sortBy {
	label: string;
	value: 'updated_at' | 'created_at' | 'likes_count';
}

const TvSeriesReviews = () => {
	const t = useTranslations();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: tvSeriesId } = getIdFromSlug(tv_series_id);
	const { colors, bottomOffset, tabBarHeight } = useTheme();
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
	const { data: tvSeries } = useMediaTvSeriesQuery({ tvSeriesId: tvSeriesId });
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaReviewsTvSeriesInfiniteQuery({
		tvSeriesId: tvSeriesId,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = data === undefined || isLoading;
	const reviews = useMemo(() => data?.pages.flat() || [], [data]);
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
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.review', { count: 2 }))}</HeaderTitle>,
			headerRight: tvSeries ? () => (
				<>
					<ButtonMyReviewTvSeries tvSeries={tvSeries} size="icon" />
				</>
			) : undefined,
		}), [tvSeries?.name, t])}
		/>
		<LegendList
		data={reviews}
		renderItem={useCallback(({ item } : { item: UserReviewTvSeries }) => (
			<CardReviewTvSeries
			review={item}
			activity={item.activity!}
			author={item.activity!.user!}
			url={`/tv-series/${tvSeries?.slug || tvSeries?.id}/review/${item.id}`}
			/>
		), [])}
		ListHeaderComponent={
			<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
				<Button
				icon={sortOrder === 'desc' ? Icons.ArrowDownNarrowWide : Icons.ArrowUpNarrowWide}
				variant="muted"
				size='icon'
				onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
				/>
				<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>{sortBy.label}</Button>
			</View>
		}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			) 
		}
		onEndReached={useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage])}
		onEndReachedThreshold={0.5}
		contentContainerStyle={{
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
				gap: GAP,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={useCallback((item: UserReviewTvSeries) => item.id.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default TvSeriesReviews;