import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { PADDING_VERTICAL } from "@/theme/globals";
import { useUserPlaylistsQuery, useUserProfileQuery } from "@/api/users/userQueries";

interface sortBy {
	label: string;
	value: 'updated_at' | 'created_at' | 'likes_count';
}

const UserPlaylistsScreen = () => {
	const t = useTranslations();
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data, } = useUserProfileQuery({ username: username });
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions = useMemo((): sortBy[] => [
		{ label: upperFirst(t('common.messages.date_created')), value: 'updated_at' },
		{ label: upperFirst(t('common.messages.date_updated')), value: 'created_at' },
		{ label: upperFirst(t('common.messages.number_of_likes')), value: 'likes_count' },
	], [t]);
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const {
		data: playlists,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useUserPlaylistsQuery({
		userId: data?.id,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = playlists === undefined || isLoading;
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
	}, [sortByOptions, showActionSheetWithOptions, sortBy.value, t]);

	return (
	<>
		<Stack.Screen
		options={{
			title: data ? `@${data.username}` : '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.playlist', { count: 2 }))}</HeaderTitle>
		}}
		/>
		<LegendList
		data={playlists?.pages.flat() || []}
		renderItem={({ item, index }) => (
			<CardPlaylist
			key={item.id}
			playlist={item}
			showItemsCount
			showPlaylistAuthor={false}
			/>
		)}
		ListHeaderComponent={
			<>
				<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
					<Button
					icon={sortOrder === 'desc' ? Icons.ArrowDown : Icons.ArrowUp}
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
		numColumns={
			SCREEN_WIDTH < 360 ? 2 :
			SCREEN_WIDTH < 414 ? 3 :
			SCREEN_WIDTH < 600 ? 4 :
			SCREEN_WIDTH < 768 ? 5 : 6
		}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			{
				paddingBottom: bottomOffset + PADDING_VERTICAL,
			},
			tw`px-4`,
		]}
		scrollIndicatorInsets={{
			bottom: tabBarHeight
		}}
		maintainVisibleContentPosition={false}
		keyExtractor={(item) => item.id.toString()}
		columnWrapperStyle={tw`gap-2`}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default UserPlaylistsScreen;