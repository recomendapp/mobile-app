import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText"
import { Link } from "expo-router";
import { View } from "react-native"

const OnboardingScreen = () => {
	return (
		<ThemedSafeAreaView>
			<ThemedText>OnBoarding SCREEEN</ThemedText>
			<Link href={"/auth/login"} replace>
				<ThemedText>Go to Login</ThemedText>
			</Link>
		</ThemedSafeAreaView>
	);
};

export default OnboardingScreen;