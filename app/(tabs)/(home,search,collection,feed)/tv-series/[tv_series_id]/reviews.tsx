import { Text, View } from "react-native";
import { useMediaReviewsTvSeriesInfiniteQuery, useMediaTvSeriesQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_VERTICAL } from "@/theme/globals";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import ButtonMyReviewTvSeries from "@/components/buttons/ButtonMyReviewTvSeries";
import { CardReviewTvSeries } from "@/components/cards/reviews/CardReviewTvSeries";
import { FadeInDown } from "react-native-reanimated";

interface sortBy {
	label: string;
	value: 'updated_at' | 'created_at' | 'likes_count';
}

const TvSeriesReviews = () => {
	const t = useTranslations();
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: tvSeriesId } = getIdFromSlug(tv_series_id);
	const { colors, bottomTabHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions: sortBy[] = [
		{ label: upperFirst(t('common.messages.date_updated')), value: 'updated_at' },
		{ label: upperFirst(t('common.messages.date_created')), value: 'created_at' },
		{ label: upperFirst(t('common.messages.number_of_likes')), value: 'likes_count' },
	];
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	// Requests
	const { data: tvSeries } = useMediaTvSeriesQuery({ tvSeriesId: tvSeriesId });
	const {
		data: reviews,
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
	const loading = reviews === undefined || isLoading;
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

	return (
	<>
		<Stack.Screen
		options={{
			title: tvSeries?.name || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.review', { count: 2 }))}</HeaderTitle>,
			headerRight: tvSeries ? () => (
				<>
					<ButtonMyReviewTvSeries tvSeries={tvSeries} size="icon" />
				</>
			) : undefined,
		}}
		/>
		<LegendList
		data={reviews?.pages.flatMap((page) => page) ?? []}
		renderItem={({ item, index }) => (
			<CardReviewTvSeries
			review={item}
			activity={item.activity}
			author={item.activity.user}
			url={`/tv-series/${tvSeries?.slug || tvSeries?.id}/review/${item.id}`}
			entering={FadeInDown}
			/>
		)}
		ListHeaderComponent={
			<>
				<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
					<Button
					icon={sortOrder === 'desc' ? Icons.ArrowDownNarrowWide : Icons.ArrowUpNarrowWide}
					variant="muted"
					size='icon'
					onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
					/>
					<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>{sortBy.label}</Button>
				</View>
			</>
		}
		ListEmptyComponent={() => (
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			) 
		)}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
			},
			tw`px-4`,
		]}
		keyExtractor={(item) => item.id.toString()}
		columnWrapperStyle={tw`gap-2`}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default TvSeriesReviews;