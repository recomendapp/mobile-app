import { ThemedText } from "@/components/ui/ThemedText"
import { useUserProfileQuery } from "@/features/user/userQueries"
import { useLocalSearchParams } from "expo-router"

const ProfileCollectionScreen = () => {
	const { username } = useLocalSearchParams();

	const {
		data,
		isLoading,
		isError,
	} = useUserProfileQuery({
		username: username as string,
	});

	return (
		<ThemedText>Collection of user {data?.full_name}</ThemedText>
	)
};

export default ProfileCollectionScreen;