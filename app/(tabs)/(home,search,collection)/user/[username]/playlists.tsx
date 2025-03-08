import { ThemedText } from "@/components/ui/ThemedText"
import { useUserProfileQuery } from "@/features/user/userQueries"
import { useLocalSearchParams } from "expo-router"

const ProfilePlaylistsScreen = () => {
	const { username } = useLocalSearchParams();

	const {
		data,
		isLoading,
		isError,
	} = useUserProfileQuery({
		username: username as string,
	});

	return (
		<ThemedText>playlists of user {data?.full_name}</ThemedText>
	)
};

export default ProfilePlaylistsScreen;