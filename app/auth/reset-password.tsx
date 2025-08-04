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

const AuthResetPasswordScreen = () => {
	const url = useLinkingURL();
	if (url) createSessionFromUrl(url);

	console.log("AuthLayout URL:", url);
	return (
		<View style={tw`flex-1 items-center justify-center`}>
			<Icons.Loader />
		</View>
	);
	// const supabase = useSupabaseClient();
	// const url = useLinkingURL();
	// const { colors } = useTheme();
	// const [error, setError] = useState<string | null>(null);

	// const handleResetPassword = useCallback(async (url: string) => {
	// 	try {
	// 		const { params, errorCode } = QueryParams.getQueryParams(url);
	// 		if (errorCode) throw new Error(errorCode);
	// 		const { code } = params;
	// 		if (!code) throw new Error("No code provided in the URL");
	// 		const { error } = await supabase.auth.exchangeCodeForSession(code);
	// 		if (error) throw error;
	// 	} catch (err) {
	// 		setError(err instanceof Error ? err.message : "An unknown error occurred");
	// 	}
	// }, [url, supabase])

	// useEffect(() => {
	// 	if (url) {
	// 		handleResetPassword(url);
	// 	}
	// }, [url]);

	// console.log("AuthLayout URL:", url);
	// return (
	// 	<View style={tw`flex-1 items-center justify-center gap-2`}>
	// 		{error ? (
	// 			<>
	// 				<Icons.AlertCircle color={colors.destructive} />
	// 				<Text style={{ color: colors.destructive }}>{error}</Text>
	// 				<Button variant="destructive" onPress={() => setError(null)}>
	// 					Try Again
	// 				</Button>
	// 			</>
	// 		) : <Icons.Loader />}
	// 	</View>
	// );
};

export default AuthResetPasswordScreen;