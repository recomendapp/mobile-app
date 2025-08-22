import { CardMedia } from "@/components/cards/CardMedia";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useUserActivitiesInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { UserActivityType } from "@/types/type.db";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import UserCollectionMovie from "@/components/screens/user/collection/UserCollectionMovie";
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from "react-native-reanimated";
import UserCollectionTvSeries from "@/components/screens/user/collection/UserCollectionTvSeries";

interface sortBy {
	label: string;
	value: 'watched_date' | 'rating';
}

// const UserCollectionScreen = () => {
// 	const t = useTranslations();
// 	const { username } = useLocalSearchParams<{ username: string }>();
// 	const { data, } = useUserProfileQuery({ username: username });
// 	const { colors, bottomTabHeight } = useTheme();
// 	const { showActionSheetWithOptions } = useActionSheet();
// 	// States
// 	const sortByOptions: sortBy[] = [
// 		{ label: upperFirst(t('common.messages.watched_date')), value: 'watched_date' },
// 		{ label: upperFirst(t('common.messages.rating')), value: 'rating' },
// 	];
// 	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
// 	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
// 	const {
// 		data: medias,
// 		isLoading,
// 		fetchNextPage,
// 		hasNextPage,
// 		isRefetching,
// 		refetch,
// 	} = useUserActivitiesInfiniteQuery({
// 		userId: data?.id,
// 		filters: {
// 			sortBy: sortBy.value,
// 			sortOrder,
// 		}
// 	});
// 	const loading = medias === undefined || isLoading;
// 	// Handlers
// 	const handleSortBy = useCallback(() => {
// 		const sortByOptionsWithCancel = [
// 			...sortByOptions,
// 			{ label: upperFirst(t('common.messages.cancel')), value: 'cancel' },
// 		];
// 		const cancelIndex = sortByOptionsWithCancel.length - 1;
// 		showActionSheetWithOptions({
// 			options: sortByOptionsWithCancel.map((option) => option.label),
// 			disabledButtonIndices: sortByOptions ? [sortByOptionsWithCancel.findIndex(option => option.value === sortBy.value)] : [],
// 			cancelButtonIndex: cancelIndex,
// 		}, (selectedIndex) => {
// 			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
// 			setSortBy(sortByOptionsWithCancel[selectedIndex] as sortBy);
// 		});
// 	}, [sortByOptions, showActionSheetWithOptions]);


// 	return (
// 	<>
// 		<Stack.Screen
// 		options={{
// 			title: data ? `@${data.username}` : '',
// 			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.collection', { count: 1 }))}</HeaderTitle>
// 		}}
// 		/>
// 		<LegendList
// 		data={medias?.pages.flatMap((page) => page) ?? []}
// 		renderItem={({ item }) => (
// 			<CardMedia
// 			key={item.id}
// 			variant="poster"
// 			media={item.media!}
// 			profileActivity={item}
// 			style={tw`w-full`}
// 			/>
// 		)}
// 		ListHeaderComponent={
// 			<>
// 				<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
// 					<Button
// 					icon={sortOrder === 'desc' ? Icons.ArrowDownNarrowWide : Icons.ArrowUpNarrowWide}
// 					variant="muted"
// 					size='icon'
// 					onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
// 					/>
// 					<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>
// 						{sortBy.label}
// 					</Button>
// 				</View>
// 			</>
// 		}
// 		ListEmptyComponent={
// 			loading ? <Icons.Loader />
// 			: (
// 				<View style={tw`flex-1 items-center justify-center p-4`}>
// 					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
// 						{upperFirst(t('common.messages.no_results'))}
// 					</Text>
// 				</View>
// 			) 
// 		}
// 		numColumns={3}
// 		onEndReached={() => hasNextPage && fetchNextPage()}
// 		onEndReachedThreshold={0.5}
// 		contentContainerStyle={[
// 			{
// 				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
// 			},
// 			tw`px-4`,
// 		]}
// 		keyExtractor={(item) => item.id.toString()}
// 		columnWrapperStyle={tw`gap-2`}
// 		refreshing={isRefetching}
// 		onRefresh={refetch}
// 		/>
// 	</>
// 	);
// };

const UserCollectionScreen = () => {
	const t = useTranslations();
	const { username, type: typeParams } = useLocalSearchParams<{ username: string, type?: UserActivityType }>();
	const { data, } = useUserProfileQuery({ username: username });
	// States
	const [type, setType] = useState<UserActivityType>(typeParams || 'movie');
	const segmentedOptions = useMemo((): { label: string, value: UserActivityType }[] => [
		{
			label: upperFirst(t('common.messages.film', { count: 2 })),
			value: 'movie',
		},
		{
			label: upperFirst(t('common.messages.tv_series', { count: 2 })),
			value: 'tv_series',
		},
	], [t]);
	const [previousTabIndex, setPreviousTabIndex] = useState(0);

	const components = useCallback(() => {
		switch (type) {
			case 'tv_series':
				return <UserCollectionTvSeries />;
			case 'movie':
			default:
				return <UserCollectionMovie />;
		}
	}, [type]);

	// Animation
	const currentIndex = segmentedOptions.findIndex((option) => option.value === type);
	const direction = currentIndex > previousTabIndex ? 'right' : 'left';
	const enteringAnimation = direction === 'right' ? FadeInRight.springify().damping(80).stiffness(200) : FadeInLeft.springify().damping(80).stiffness(200);
	const exitingAnimation = direction === 'right' ? FadeOutLeft.springify().damping(80).stiffness(200) : FadeOutRight.springify().damping(80).stiffness(200);

	return (
	<>
		<Stack.Screen
		options={{
			title: data ? `@${data.username}` : '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.collection', { count: 1 }))}</HeaderTitle>
		}}
		/>
		<View style={{ paddingHorizontal: PADDING_HORIZONTAL, paddingBottom: PADDING_VERTICAL }}>
			<SegmentedControl
			values={segmentedOptions.map(option => option.label)}
			selectedIndex={segmentedOptions.findIndex(option => option.value === type)}
			onChange={(event) => {
				setPreviousTabIndex(currentIndex);
				setType(segmentedOptions[event.nativeEvent.selectedSegmentIndex].value);
			}}
			/>
		</View>
		<Animated.View
			key={`selected_tab_${type}`}
			entering={enteringAnimation}
			exiting={exitingAnimation}
			style={tw`flex-1`}
		>
			{components()}
		</Animated.View>
	</>
	)
}

export default UserCollectionScreen;