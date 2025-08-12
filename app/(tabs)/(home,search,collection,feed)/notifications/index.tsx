import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { Icons } from "@/constants/Icons";
import { Stack, useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

const NotificationsScreen = () => {
	const router = useRouter();
	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
				<Button
				variant="ghost"
				icon={Icons.UserPlus}
				size="icon"
				onPress={() => router.push("/notifications/follow-requests")}
				/>
			)
		}}
		/>
		<ScrollView>
			<Text>Notifications</Text>
		</ScrollView>
	</>
	)
};

export default NotificationsScreen;