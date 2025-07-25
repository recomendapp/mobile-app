import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { Button } from "@/components/ui/button";
import { Icons } from "@/constants/Icons";
import { useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";
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
	value: 'updated_at' | 'created_at' | 'likes_count';
}

interface MediaPlaylistsProps {
	mediaId?: number | null;
}

const MediaPlaylists = ({
	mediaId,
} : MediaPlaylistsProps) => {
	const { t, i18n } = useTranslation();
	const { colors, inset } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	const bottomTabBarHeight = useBottomTabOverflow();
	// States
	const sortByOptions: sortBy[] = [
		{ label: upperFirst(t('common.messages.date_created')), value: 'updated_at' },
		{ label: upperFirst(t('common.messages.date_updated')), value: 'created_at' },
		{ label: upperFirst(t('common.messages.number_of_likes')), value: 'likes_count' },
	];
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const {
		data: playlists,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaPlaylistsInfiniteQuery({
		id: mediaId,
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
		data={playlists?.pages.flatMap((page) => page) ?? []}
		renderItem={({ item }) => (
			<CardPlaylist key={item.id} playlist={item} />
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

export default MediaPlaylists;