
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useUserActivitiesMovieInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTranslations } from "use-intl";
import { PADDING_VERTICAL } from "@/theme/globals";
import { CardMovie } from "@/components/cards/CardMovie";
import { FadeInDown } from "react-native-reanimated";

interface sortBy {
	label: string;
	value: 'watched_date' | 'rating';
}

const UserCollectionMovie = () => {
	const t = useTranslations();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data, } = useUserProfileQuery({ username: username });
	const { colors, bottomTabHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions: sortBy[] = [
		{ label: upperFirst(t('common.messages.watched_date')), value: 'watched_date' },
		{ label: upperFirst(t('common.messages.rating')), value: 'rating' },
	];
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const {
		data: medias,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useUserActivitiesMovieInfiniteQuery({
		userId: data?.id || undefined,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = medias === undefined || isLoading;
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
		<LegendList
		data={medias?.pages.flatMap((page) => page) ?? []}
		renderItem={({ item, index }) => (
			<CardMovie
			key={item.id}
			variant="poster"
			movie={item.movie!}
			profileActivity={item}
			style={tw`w-full`}
			entering={FadeInDown.delay(index * 50)}
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
					<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>
						{sortBy.label}
					</Button>
				</View>
			</>
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

export default UserCollectionMovie;