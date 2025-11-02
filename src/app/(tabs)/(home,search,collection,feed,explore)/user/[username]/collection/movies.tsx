
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useUserActivitiesMovieInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useTranslations } from "use-intl";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CardMovie } from "@/components/cards/CardMovie";
import { FadeInDown } from "react-native-reanimated";

interface sortBy {
	label: string;
	value: 'watched_date' | 'rating';
}

const UserCollectionMovieScreen = () => {
	const t = useTranslations();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data: userProfile } = useUserProfileQuery({ username: username });
	const { colors, tabBarHeight, bottomOffset } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions: sortBy[] = [
		{ label: upperFirst(t('common.messages.watched_date')), value: 'watched_date' },
		{ label: upperFirst(t('common.messages.rating')), value: 'rating' },
	];
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const {
		data: movies,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useUserActivitiesMovieInfiniteQuery({
		userId: userProfile?.id || undefined,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = movies === undefined || isLoading;
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
		data={movies?.pages.flat() || []}
		renderItem={({ item }) => (
			<CardMovie
			variant="poster"
			movie={item.movie!}
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
		numColumns={3}
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

export default UserCollectionMovieScreen;