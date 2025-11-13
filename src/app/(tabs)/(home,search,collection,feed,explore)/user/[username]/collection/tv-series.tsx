
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useUserActivitiesTvSeriesInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { useTranslations } from "use-intl";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import { FadeInDown } from "react-native-reanimated";

interface sortBy {
	label: string;
	value: 'watched_date' | 'rating';
}

const UserCollectionTvSeries = () => {
	const t = useTranslations();
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data, } = useUserProfileQuery({ username: username });
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions: sortBy[] = [
		{ label: upperFirst(t('common.messages.watched_date')), value: 'watched_date' },
		{ label: upperFirst(t('common.messages.rating')), value: 'rating' },
	];
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const {
		data: tvSeries,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useUserActivitiesTvSeriesInfiniteQuery({
		userId: data?.id || undefined,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = tvSeries === undefined || isLoading;
	// Handlers
	const handleSortBy = () => {
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
	};


	return (
	<>
		<LegendList
		data={tvSeries?.pages.flat() || []}
		renderItem={({ item }) => (
			<CardTvSeries
			key={item.id}
			variant="poster"
			tvSeries={item.tv_series!}
			profileActivity={item}
			style={tw`w-full`}
			entering={FadeInDown}
			/>
		)}
		ListHeaderComponent={
			<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
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
		numColumns={
			SCREEN_WIDTH < 360 ? 2 :
			SCREEN_WIDTH < 414 ? 3 :
			SCREEN_WIDTH < 600 ? 4 :
			SCREEN_WIDTH < 768 ? 5 : 6
		}
		onEndReachedThreshold={0.5}
		contentContainerStyle={{
			gap: GAP,
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		keyExtractor={(item) => item.id.toString()}
		onEndReached={() => hasNextPage && fetchNextPage()}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default UserCollectionTvSeries;