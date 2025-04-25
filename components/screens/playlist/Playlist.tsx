import PlaylistHeader from "@/components/screens/playlist/PlaylistHeader";
import { Button, ButtonText } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { usePlaylistItems } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { type Playlist as TPlaylist } from "@/types/type.db";
import { capitalize } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

interface PlaylistProps {
	playlist?: TPlaylist | null;
	loading: boolean;
	isRefetching: boolean;
	refetch: () => void;
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
}

const Playlist = ({
	playlist,
	loading,
	isRefetching,
	refetch,
	scrollY,
	headerHeight,
	headerOverlayHeight,
} : PlaylistProps) => {
	const { t } = useTranslation();
	const {
		data: playlistItems
	} = usePlaylistItems(playlist?.id);
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	const backdrops = React.useMemo(() => {
		return playlistItems?.map((item) => item.media?.backdrop_url) || [];
	}, [playlistItems]);
	const renderHeader = React.useCallback(() => (
	<>
		<PlaylistHeader
		playlist={playlist}
		scrollY={scrollY}
		headerHeight={headerHeight}
		headerOverlayHeight={headerOverlayHeight}
		loading={loading}
		backdrops={backdrops}
		/>
		{/* <DataTableToolbar table={table} /> */}
	</>
	), [playlist]);
	const renderEmpty = React.useCallback(() => {
		if (!playlist) return null;
		return (
			<View style={tw`flex-1 items-center justify-center gap-2`}>
				<ThemedText>{capitalize(t('common.messages.no_results'))}</ThemedText>
				<Button style={tw`rounded-full`}>
					<ButtonText>Ajouter à cette playlist</ButtonText>
				</Button>
			</View>
		)
	}, [playlist]);
	return (
	<Animated.FlatList
	onScroll={scrollHandler}
	ListHeaderComponent={renderHeader}
	ListHeaderComponentStyle={tw`mb-2`}
	// data={table.getRowModel().rows}
	data={playlistItems}
	renderItem={({ item, index }) => (
		<View key={index}>
			<ThemedText>item: {index}</ThemedText>
		</View>
	)}
	ListEmptyComponent={renderEmpty}
	showsVerticalScrollIndicator={false}
	refreshing={isRefetching}
	onRefresh={refetch}
	/>
	);
};

export default Playlist;