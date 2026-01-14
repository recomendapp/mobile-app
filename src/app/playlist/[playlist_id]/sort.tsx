import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import tw from "@/lib/tw";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { PlaylistSortMovie } from "@/components/screens/playlist/sort/PlaylistSortMovie";
import { PlaylistSortTvSeries } from "@/components/screens/playlist/sort/PlaylistSortTvSeries";
import { useCallback } from "react";
import { usePlaylistDetailsQuery } from "@/api/playlists/playlistQueries";

const PlaylistSortScreen = () => {
	const t = useTranslations();
	const router = useRouter();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id);
	const {
		data: playlist,
	} = usePlaylistDetailsQuery({
		playlistId: playlistId,
	});

	const handleClose = useCallback(() => {
		router.back();
	}, [router]);
	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: upperFirst(t('common.messages.edit_order')),
			unstable_headerLeftItems: (props) => [
				{
					type: "button",
					label: upperFirst(t('common.messages.close')),
					onPress: handleClose,
					icon: {
						name: "xmark",
						type: "sfSymbol",
					},
				},
			],
		}}
		/>
		{playlist ? (
			playlist.type === 'movie' ? (
				<PlaylistSortMovie />
			) : playlist.type === 'tv_series' && (
				<PlaylistSortTvSeries />
			)
		) : <View style={tw`flex-1 items-center justify-center p-4`}><Icons.Loader /></View>}
	</>
	)
};

export default PlaylistSortScreen;