import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { Button, buttonTextVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThemedText } from "@/components/ui/ThemedText"
import { Icons } from "@/constants/Icons";
import {  useUserPlaylistsInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries"
import { useActionSheet } from "@expo/react-native-action-sheet";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";

const GRID_COLUMNS = 3;

const ProfilePlaylistsScreen = () => {
	const { username } = useLocalSearchParams();
	const { t } = useTranslation();
	const { showActionSheetWithOptions } = useActionSheet();
	const [display, setDisplay] = useState<'grid' | 'row'>('grid');
	const sortByOptions = [
		{ label: t('common.messages.created_at'), value: 'created_at' },
		{ label: t('common.messages.updated_at'), value: 'updated_at' },
		{ label: t('common.messages.likes_count'), value: 'likes_count' },
		{ label: t('common.word.cancel'), value: 'cancel' },
	];
	const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'likes_count'>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const { data, } = useUserProfileQuery({ username: username as string });
	const {
		data: activities,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
	} = useUserPlaylistsInfiniteQuery({
		userId: data?.id,
		filters: {
			sortBy: sortBy,
			sortOrder: sortOrder,
			perPage: GRID_COLUMNS * 5,
		}
	});

	const loading = isLoading || activities === undefined;

	const handleSortBy = () => {
		const cancelIndex = sortByOptions.length - 1;
		showActionSheetWithOptions({
			options: sortByOptions.map((option) => upperFirst(option.label)),
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			setSortBy(sortByOptions[selectedIndex].value as 'created_at' | 'updated_at' | 'likes_count');
		});
	};

	return (
		<>
			<View>
				<View className="flex flex-row justify-end items-center gap-2">
					<Button variant={'ghost'} size={'sm'} onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}>
					{sortOrder === 'desc' ? <Icons.ArrowDownNarrowWide size={20} className="text-foreground"/> : <Icons.ArrowUpNarrowWide size={20} className="text-foreground" />}
					</Button>
					<Button variant={'secondary'} size={'fit'} onPress={handleSortBy} className="flex-row items-center gap-1">
						<Text className={buttonTextVariants({variant: 'secondary'})}>{upperFirst(t(`common.messages.${sortBy}`))}</Text>
						<Icons.ChevronDown size={20} className="text-foreground"/>
					</Button>
				</View>
			</View>
			{activities?.pages[0].length ?
				<FlashList
				data={activities.pages.flat()}
				renderItem={({ item, index }) => (
					<View key={index} className="p-1">
						<CardPlaylist
						key={item.id}
						playlist={item}
						className="w-full"
						/>
					</View>
				)}
				className="h-full"
				keyExtractor={(_, index) => index.toString()}
				estimatedItemSize={190 * 15}
				refreshing={isFetching}
				numColumns={display === 'grid' ? GRID_COLUMNS : 1}
				onEndReached={() => hasNextPage && fetchNextPage()}
				onEndReachedThreshold={0.3}
				nestedScrollEnabled
				// ItemSeparatorComponent={() => <View className="w-2" />}
				/>
			: loading ? <Skeleton className="h-48 w-full" />
			: <ThemedText className="text-center">{upperFirst(t('common.messages.no_results'))}</ThemedText>}
		</>
	);
};

export default ProfilePlaylistsScreen;