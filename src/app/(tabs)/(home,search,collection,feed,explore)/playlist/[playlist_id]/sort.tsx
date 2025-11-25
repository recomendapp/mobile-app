import { usePlaylistQuery } from "@/features/playlist/playlistQueries";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import tw from "@/lib/tw";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { PlaylistSortMovie } from "@/components/screens/playlist/sort/PlaylistSortMovie";
import { PlaylistSortTvSeries } from "@/components/screens/playlist/sort/PlaylistSortTvSeries";

const PlaylistSortScreen = () => {
	const t = useTranslations();
	const router = useRouter();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id);
	const {
		data: playlist,
	} = usePlaylistQuery({
		playlistId: playlistId,
	});
	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: upperFirst(t('common.messages.edit_order')),
			headerLeft: router.canDismiss() ? () => (
				<Button
				variant="ghost"
				size="fit"
				onPress={() => router.dismiss()}
				>
					{upperFirst(t('common.messages.close'))}
				</Button>
			) : undefined,
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