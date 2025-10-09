import { useMediaPersonQuery, useMediaPersonTvSeriesInfiniteQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native"
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { LegendList } from "@legendapp/list";
import tw from "@/lib/tw";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "@/components/ui/text";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CardTvSeries } from "@/components/cards/CardTvSeries";

interface sortBy {
	label: string;
	value: 'last_appearance_date' | 'release_date' | 'vote_average';
}

const PersonTvSeriesScreen = () => {
	const t = useTranslations();
	const { person_id } = useLocalSearchParams<{ person_id: string }>();
	const { id: personId } = getIdFromSlug(person_id);
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions = useMemo((): sortBy[] => [
		{ label: upperFirst(t('common.messages.last_appearance_date')), value: 'last_appearance_date' },
		{ label: upperFirst(t('common.messages.release_date')), value: 'release_date' },
		{ label: upperFirst(t('common.messages.vote_average')), value: 'vote_average' },
	], [t]);
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	// Queries
	const { data: person } = useMediaPersonQuery({ personId });
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaPersonTvSeriesInfiniteQuery({
		personId: personId,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = useMemo(() => data === undefined || isLoading, [data, isLoading]);
	const tvSeries = useMemo(() => data?.pages.flat() || [], [data]);
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
			title: person?.name || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.tv_series', { count: 2 }))}</HeaderTitle>,
		}}
		/>
		<LegendList
		data={tvSeries}
		renderItem={useCallback(({ item } : { item: typeof tvSeries[number] }) => (
			<CardTvSeries
			variant="poster"
			tvSeries={item.tv_series}
			style={tw`w-full`}
			/>
		), [])}
		ListHeaderComponent={
			<View style={tw`flex flex-row justify-end items-center gap-2 py-2`}>
				<Button
				icon={sortOrder === 'desc' ? Icons.ArrowDownNarrowWide : Icons.ArrowUpNarrowWide}
				variant="muted"
				size='icon'
				onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
				/>
				<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>
					{sortBy.label}
				</Button>
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
		numColumns={3}
		onEndReached={useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage])}
		onEndReachedThreshold={0.5}
		contentContainerStyle={{
			gap: GAP,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
			paddingHorizontal: PADDING_HORIZONTAL,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={useCallback((item: typeof tvSeries[number]) => item.tv_series.id.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default PersonTvSeriesScreen;