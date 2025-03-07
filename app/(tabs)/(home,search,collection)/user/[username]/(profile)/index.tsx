import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView"
import { ThemedText } from "@/components/ui/ThemedText"
import { ThemedView } from "@/components/ui/ThemedView"
import { useUserProfileQuery } from "@/features/user/userQueries"
import { useLocalSearchParams } from "expo-router"

const User = () => {
	const { username } = useLocalSearchParams();

	const {
		data,
		isLoading,
		isError,
	} = useUserProfileQuery({
		username: username as string,
	});

	return (
		<ThemedText>User {data?.full_name}</ThemedText>
	)
}

export default User