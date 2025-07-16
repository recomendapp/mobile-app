import { useAuth } from "@/providers/AuthProvider";
import { Stack } from "expo-router";

const ReviewLayout = () => {
	const { session } = useAuth();
	return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
		<Stack.Screen name="create/[media_id]/index" />
	  </Stack.Protected>
    </Stack>
	);
};

export default ReviewLayout;