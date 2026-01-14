import { Icons } from "@/constants/Icons";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useLocalSearchParams } from "expo-router";
import BottomSheetPlaylist from "@/components/bottom-sheets/sheets/BottomSheetPlaylist";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { Button } from "@/components/ui/Button";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useSharedValue } from "react-native-reanimated";
import ButtonActionPlaylistLike from "@/components/buttons/ButtonActionPlaylistLike";
import ButtonActionPlaylistSaved from "@/components/buttons/ButtonActionPlaylistSaved";
import CollectionHeader from "@/components/collection/CollectionHeader";
import { PlaylistMovie } from "@/components/screens/playlist/PlaylistMovie";
import { PlaylistTvSeries } from "@/components/screens/playlist/PlaylistTvSeries";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePlaylistDetailsQuery } from "@/api/playlists/playlistQueries";
import { useUserPlaylistLike } from "@/api/users/hooks/useUserPlaylistLike";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserPlaylistSaved } from "@/api/users/hooks/useUserPlaylistSaved";
import { useAuth } from "@/providers/AuthProvider";

const PlaylistScreen = () => {
	const t = useTranslations();
	const { session } = useAuth();
	const { colors } = useTheme();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id) || undefined;
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const { data: playlist } = usePlaylistDetailsQuery({
		playlistId: playlistId,
	});

	const { isLiked, toggle: toggleLike } = useUserPlaylistLike({ playlistId });
	const { isSaved, toggle: toggleSaved } = useUserPlaylistSaved({ playlistId });

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
					<ButtonActionPlaylistLike playlist={playlist} />
					<ButtonActionPlaylistSaved playlist={playlist} />
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={() => openSheet(BottomSheetPlaylist, {
						playlist: playlist
					})}
					/>
				</View>
			) : undefined,
			unstable_headerRightItems: (props) => [
				...(session && playlist && session.user.id !== playlist.user_id ? [
					{
						type: "button",
						label: upperFirst(t('common.messages.like')),
						onPress: toggleLike,
						icon: {
							name: isLiked ? "heart.fill" : "heart",
							type: "sfSymbol",
						},
						tintColor: isLiked ? colors.accentPink : undefined,
					},
					{
						type: "button",
						label: upperFirst(t('common.messages.save')),
						onPress: toggleSaved,
						icon: {
							name: isSaved ? "bookmark.fill" : "bookmark",
							type: "sfSymbol",
						},
						tintColor: isSaved ? colors.foreground : undefined,
					},
				] as const : []),
				{
					type: "button",
					label: upperFirst(t('common.messages.menu')),
					onPress: () => {
						if (playlist) {
							openSheet(BottomSheetPlaylist, {
								playlist: playlist
							})
						}
					},
					icon: {
						name: "ellipsis",
						type: "sfSymbol",
					},
				},
			]
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