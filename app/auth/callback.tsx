import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { createSessionFromUrl } from "@/lib/supabase/auth";
import tw from "@/lib/tw";
import { useLinkingURL } from "expo-linking";

const AuthCallbackScreen = () => {
	const url = useLinkingURL();
	if (url) createSessionFromUrl(url);

	console.log("AuthLayout URL:", url);
	return (
		<View style={tw`flex-1 items-center justify-center`}>
			<Icons.Loader />
		</View>
	);
};

export default AuthCallbackScreen;