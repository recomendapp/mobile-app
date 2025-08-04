import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { createSessionFromUrl } from "@/lib/supabase/auth";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { AuthError } from "expo-auth-session";
import { useLinkingURL } from "expo-linking";
import { useEffect, useState } from "react";

const AuthCallbackScreen = () => {
	const url = useLinkingURL();
	const { colors } = useTheme();
	const { createSessionFromUrl } = useAuth();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (url) {
			createSessionFromUrl(url).catch((error) => {
				if (error instanceof AuthError) {
					setError(error.message);
				} else if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("An unknown error occurred while processing the reset password.");
				}
			});
		}
	}, [url]);
	return (
		<View style={tw`flex-1 items-center justify-center`}>
			<Icons.Loader />
		</View>
	);
};

export default AuthCallbackScreen;