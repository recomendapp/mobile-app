import { ThemedText } from "@/components/ui/ThemedText"
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native"

const ReviewCreateScreen = () => {
	const { media_id } = useLocalSearchParams();
	return (
		<View>
			<ThemedText>Review {media_id}</ThemedText>
		</View>
	);
};

export default ReviewCreateScreen;