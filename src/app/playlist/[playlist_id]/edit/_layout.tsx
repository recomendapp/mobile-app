import { usePlaylistDetailsQuery } from "@/api/playlists/playlistQueries";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";

const ModalPlaylistEditLayout = () => {
	const router = useRouter();
	const { session } = useAuth();
	const { colors, defaultScreenOptions } = useTheme();
	const params = useLocalSearchParams<{ playlist_id: string }>();
	const playlistId = Number(params.playlist_id);

	const {
		data: playlist,
		isLoading,
	} = usePlaylistDetailsQuery({
		playlistId: playlistId,
	});
	const loading = playlist === undefined || isLoading;
	const isPlaylistOwner = playlist && playlist.user_id === session?.user.id;

	if (!loading && (!playlist || !isPlaylistOwner)) {
		if (router.canGoBack()) {
			return <Redirect href={".."} />;
		} else {
			return <Redirect href={"/"} />;
		}
	}
	return (
		<Stack 
		screenOptions={{
			...defaultScreenOptions,
			headerStyle: {
				backgroundColor: colors.muted,
			},
		}}
		/>
	)
};

export default ModalPlaylistEditLayout;
