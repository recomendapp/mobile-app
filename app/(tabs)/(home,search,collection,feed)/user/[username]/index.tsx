import ProfileLastActivities from "@/components/screens/user/ProfileLastActivities";
import { ThemedText } from "@/components/ui/ThemedText"
import { useUserActivitiesInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries"
import { Profile } from "@/types/type.db";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";

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