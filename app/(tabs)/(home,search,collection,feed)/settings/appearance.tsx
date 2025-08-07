import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { Text } from "react-native";
import Animated from "react-native-reanimated";

const SettingsAppearanceScreen = () => {
	const { colors } = useTheme();
	return (
		<Animated.ScrollView>
			<Text style={[{ color: colors.mutedForeground }, tw`text-sm italic`]}>
				Not implemented yet
			</Text>
		</Animated.ScrollView>
	)
};

export default SettingsAppearanceScreen;