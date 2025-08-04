import ProfileLastActivities from "@/components/screens/user/ProfileLastActivities";
import { useUserProfileQuery } from "@/features/user/userQueries"
import { useLocalSearchParams } from "expo-router"

const ProfileScreen = () => {
	const { username } = useLocalSearchParams();

	const {
		data,
		isLoading,
		isError,
	} = useUserProfileQuery({
		username: username as string,
	});

	if (!data) return null;

	return (
	<>
		<ProfileLastActivities profile={data} />	
		{/* <ThemedText>User {data?.full_name}</ThemedText> */}
	</>
	)
};

export default ProfileScreen;