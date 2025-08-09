
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { useUserSubscriptionsQuery } from "@/features/user/userQueries";
import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";

const SettingsSubscriptionScreen = () => {
	const { user } = useAuth();
	const { colors, bottomTabHeight } = useTheme();
	const {
		data: subscription,
		isLoading,
	} = useUserSubscriptionsQuery({
		userId: user?.id,
	});
	const loading = subscription === undefined || isLoading;
	return (
	<>
		<ScrollView
		contentContainerStyle={[
			tw`flex-1 gap-2 p-4`,
			{ paddingBottom: bottomTabHeight + 8 }
		]}
		>
			{loading ? (
				<View style={tw`flex-1 items-center justify-center	`}>
					<Icons.Loader />
				</View>
			) : (
				<View>
					<Text style={[{ color: colors.mutedForeground }, tw`text-center text-sm italic`]}>
						Not implemented yet
					</Text>
				</View>
			)}
		</ScrollView>
	</>
	)
};

export default SettingsSubscriptionScreen;