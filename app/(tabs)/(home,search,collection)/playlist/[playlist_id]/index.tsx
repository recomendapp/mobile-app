import BottomSheetPlaylist from "@/components/bottom-sheets/sheets/BottomSheetPlaylist";
import PlaylistHeader from "@/components/screens/playlist/PlaylistHeader";
import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { usePlaylistFull } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useLocalSearchParams } from "expo-router";
import { capitalize } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

const PlaylistScreen = () => {
	const { t } = useTranslation();
	const { playlist_id } = useLocalSearchParams();
	const { openSheet } = useBottomSheetStore();
	const {
		data: playlist,
		isLoading,
		isRefetching,
		refetch,
	} = usePlaylistFull(Number(playlist_id));
	const loading = isLoading || playlist === undefined;
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	const headerOverlayHeight = useSharedValue(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	const renderHeader = React.useCallback(() => (
	<>
		<PlaylistHeader
		playlist={playlist}
		scrollY={scrollY}
		headerHeight={headerHeight}
		headerOverlayHeight={headerOverlayHeight}
		loading={loading}
		backdrops={[]}
		/>
		{/* <DataTableToolbar table={table} /> */}
	</>
	), [playlist]);
	const renderEmpty = React.useCallback(() => (
		<View style={tw`flex-1 items-center justify-center`}>
			<ThemedText>{capitalize(t('common.messages.no_results'))}</ThemedText>
		</View>
	), []);
	return (
		<ThemedView style={tw`flex-1`}>
			<HeaderOverlay
			triggerHeight={headerHeight}
			headerHeight={headerOverlayHeight}
			onHeaderHeight={(height) => {
				'worklet';
				headerOverlayHeight.value = height;
			}}
			scrollY={scrollY}
			title={playlist?.title ?? ''}
			onMenuPress={playlist ? () => {
				openSheet(BottomSheetPlaylist, {
					playlist: playlist,
				})
			} : undefined}
			/>

			<Animated.FlatList
			onScroll={scrollHandler}
			ListHeaderComponent={renderHeader}
			ListHeaderComponentStyle={tw`mb-2`}
			// data={table.getRowModel().rows}
			data={[{ id: 1 }]}
			renderItem={({ item, index }) => (
				<View key={item.id}>
					<ThemedText>{index}</ThemedText>
				</View>
			)}
			ListEmptyComponent={renderEmpty}
			// keyExtractor={(item) => item.original.id.toString()}
			showsVerticalScrollIndicator={false}
			refreshing={isRefetching}
			onRefresh={refetch}
			/>
		</ThemedView>
	);
};

export default PlaylistScreen;