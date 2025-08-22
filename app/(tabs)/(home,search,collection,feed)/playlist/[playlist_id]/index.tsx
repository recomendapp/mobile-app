import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useLocalSearchParams } from "expo-router";
import { usePlaylistQuery } from "@/features/playlist/playlistQueries";
import BottomSheetPlaylist from "@/components/bottom-sheets/sheets/BottomSheetPlaylist";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { Button } from "@/components/ui/Button";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useSharedValue } from "react-native-reanimated";
import ButtonActionPlaylistLike from "@/components/buttons/ButtonActionPlaylistLike";
import ButtonActionPlaylistSaved from "@/components/buttons/ButtonActionPlaylistSaved";
import CollectionHeader from "@/components/screens/collection/CollectionHeader";
import { PlaylistMovie } from "@/components/screens/playlist/PlaylistMovie";
import { PlaylistTvSeries } from "@/components/screens/playlist/PlaylistTvSeries";

const PlaylistScreen = () => {
	const { session } = useAuth();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id) || undefined;
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const { data: playlist } = usePlaylistQuery({
		playlistId: playlistId,
	});

	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: playlist?.title ?? '',
			headerRight: playlist ? () => (
				<View style={tw`flex-row items-center`}>
					{session && playlist && session.user.id !== playlist.user_id && (
						<>
						<ButtonActionPlaylistLike playlistId={playlist.id} />
						<ButtonActionPlaylistSaved playlistId={playlist.id} />
						</>
					)}
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={() => openSheet(BottomSheetPlaylist, {
						playlist: playlist
					})}
					/>
				</View>
			) : undefined
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		/>
		{playlist ? (
			playlist.type === 'movie' ? (
				<PlaylistMovie playlist={playlist} scrollY={scrollY} headerHeight={headerHeight} />
			) : playlist.type === 'tv_series' && (
				<PlaylistTvSeries playlist={playlist} scrollY={scrollY} headerHeight={headerHeight} />
			)
		) : (
			<CollectionHeader
			scrollY={scrollY}
			headerHeight={headerHeight}
			poster=""
			loading={true}
			/>
		)}
	</>
	)
};

export default PlaylistScreen;