import { CardMedia } from "@/components/cards/CardMedia";
import { Button, buttonTextVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThemedText } from "@/components/ui/ThemedText"
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useUserActivitiesInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries"
import tw from "@/lib/tw";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Picker } from "@react-native-picker/picker";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";

const GRID_COLUMNS = 3;
export const PER_PAGE = GRID_COLUMNS * 5;

const ProfileCollectionScreen = () => {
	const { colors } = useTheme();
	const { username } = useLocalSearchParams();
	const { t } = useTranslation();
	const { showActionSheetWithOptions } = useActionSheet();
	const [display, setDisplay] = useState<'grid' | 'row'>('grid');
	const sortByOptions = [
		{ label: t('common.messages.watched_date'), value: 'watched_date' },
		{ label: t('common.messages.rating'), value: 'rating' },
		{ label: t('common.word.cancel'), value: 'cancel' },
	];
	const [sortBy, setSortBy] = useState<'watched_date' | 'rating'>('watched_date');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const { data, } = useUserProfileQuery({ username: username as string });
	const {
		data: activities,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
	} = useUserActivitiesInfiniteQuery({
		userId: data?.id,
		filters: {
			sortBy: sortBy,
			sortOrder: sortOrder,
			perPage: PER_PAGE,
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
			setSortBy(sortByOptions[selectedIndex].value as 'watched_date' | 'rating');
		});
	};

	return (
		<>
			<View>
				<View style={tw.style('flex flex-row justify-end items-center gap-2')}>
					<Button variant={'ghost'} size={'sm'} onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}>
					{sortOrder === 'desc' ? <Icons.ArrowDownNarrowWide color={colors.foreground} size={20} /> : <Icons.ArrowUpNarrowWide color={colors.foreground} size={20} />}
					</Button>
					<Button variant={'secondary'} size={'fit'} onPress={handleSortBy} style={tw.style('flex-row items-center gap-1')}>
						<Text className={buttonTextVariants({variant: 'secondary'})}>{upperFirst(t(`common.messages.${sortBy}`))}</Text>
						<Icons.ChevronDown color={colors.foreground} size={20} />
					</Button>
				</View>
			</View>
			{activities?.pages[0].length ?
				<FlashList
				data={activities.pages.flat()}
				renderItem={({ item, index }) => (
					<View key={index} style={tw.style('p-0.5')}>
						<CardMedia
						key={item.id}
						variant='poster'
						media={item.media!}
						index={index}
						style={tw.style('w-full')}
						/>
					</View>
				)}
				keyExtractor={(_, index) => index.toString()}
				estimatedItemSize={190 * 15}
				refreshing={isFetching}
				numColumns={display === 'grid' ? GRID_COLUMNS : 1}
				onEndReached={() => hasNextPage && fetchNextPage()}
				onEndReachedThreshold={0.3}
				nestedScrollEnabled
				// ItemSeparatorComponent={() => <View className="w-2" />}
				/>
			: loading ? <Skeleton style={tw.style('h-48 w-full')} />
			: <ThemedText style={tw.style('text-center')}>{upperFirst(t('common.messages.no_results'))}</ThemedText>}
		</>
	);
};

export default ProfileCollectionScreen;