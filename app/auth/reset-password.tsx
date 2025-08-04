import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useLinkingURL } from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { createSessionFromUrl } from "@/lib/supabase/auth";
import { useAuth } from "@/providers/AuthProvider";
import { AuthError } from "@supabase/supabase-js";

const AuthResetPasswordScreen = () => {
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
		<View style={tw`flex-1 items-center justify-center gap-2`}>
			{error ? (
				<>
					<Icons.AlertCircle color={colors.destructive} />
					<Text style={{ color: colors.destructive }}>{error}</Text>
					<Button variant="destructive" onPress={() => setError(null)}>
						Try Again
					</Button>
				</>
			) : <Icons.Loader />}
		</View>
	);
};

export default AuthResetPasswordScreen;