
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { useUserSubscriptionsQuery } from "@/features/user/userQueries";
import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";

const SettingsSubscriptionScreen = () => {
	const { session } = useAuth();
	const { colors, bottomTabHeight, inset } = useTheme();
	const {
		data: subscription,
		isLoading,
	} = useUserSubscriptionsQuery({
		userId: session?.user.id,
	});
	const loading = subscription === undefined || isLoading;
	return (
	<>
		<ScrollView
		contentContainerStyle={{
			gap: GAP,
			paddingTop: PADDING_VERTICAL,
			paddingLeft: inset.left + PADDING_HORIZONTAL,
			paddingRight: inset.right + PADDING_HORIZONTAL,
			paddingBottom: bottomTabHeight + PADDING_VERTICAL
		}}
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