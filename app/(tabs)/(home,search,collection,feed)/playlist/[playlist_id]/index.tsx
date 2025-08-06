import BottomSheetPlaylist from "@/components/bottom-sheets/sheets/BottomSheetPlaylist";
import Playlist from "@/components/screens/playlist/Playlist";
import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedView } from "@/components/ui/ThemedView";
import { usePlaylistFull } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useSharedValue } from "react-native-reanimated";

const PlaylistScreen = () => {
	const { playlist_id } = useLocalSearchParams();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
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
			<Playlist
			playlist={playlist}
			loading={loading}
			isRefetching={isRefetching}
			refetch={refetch}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			/>
		</ThemedView>
	);
};

export default PlaylistScreen;