import { CardReview } from "@/components/cards/CardReview";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useMediaReviewsInfiniteQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const PADDING_BOTTOM = 8;

interface sortBy {
	label: string;
	value: 'updated_at';
}

interface MediaReviewsProps {
	mediaId?: number | null;
}

const MediaReviews = ({
	mediaId,
} : MediaReviewsProps) => {
	const { t } = useTranslation();
	const { colors, inset } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	const bottomTabBarHeight = useBottomTabOverflow();
	// States
	const sortByOptions: sortBy[] = [
		{ label: upperFirst(t('common.messages.date_published')), value: 'updated_at' },
	];
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const {
		data: reviews,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaReviewsInfiniteQuery({
		id: mediaId,
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
			{ label: upperFirst(t('common.word.cancel')), value: 'cancel' },
		];
		const cancelIndex = sortByOptionsWithCancel.length - 1;
		showActionSheetWithOptions({
			options: sortByOptionsWithCancel.map((option) => option.label),
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			setSortBy(sortByOptionsWithCancel[selectedIndex] as sortBy);
		});
	}, [sortByOptions, showActionSheetWithOptions]);

	return (
		<LegendList
		data={reviews?.pages.flatMap((page) => page) ?? []}
		renderItem={({ item }) => (
			<CardReview key={item.id} review={item} activity={item.activity} author={item.activity.user} />
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
					<Button icon={Icons.ChevronDown} variant="muted" style={tw`h-10 rounded-full`} onPress={handleSortBy}>{sortBy.label}</Button>
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
				paddingBottom: bottomTabBarHeight + inset.bottom + PADDING_BOTTOM,
			},
			tw`px-4`,
		]}
		keyExtractor={(item) => item.id.toString()}
		columnWrapperStyle={tw`gap-2`}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	);
};

export default MediaReviews;