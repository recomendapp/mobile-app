import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useLinkingURL } from "expo-linking";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { AuthError } from "@supabase/supabase-js";
import { Redirect } from "expo-router";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const AuthResetPasswordScreen = () => {
	const url = useLinkingURL();
	const t = useTranslations();
	const { createSessionFromUrl } = useAuth();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (url) {
			createSessionFromUrl(url)
				.catch((error) => {
				let errorMessage: string = "An unknown error occurred while processing the reset password.";
				if (error instanceof AuthError) {
					errorMessage = error.message;
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: errorMessage,
					preset: "error",
					haptic: "error",
				});
				setError(errorMessage);
				});
		}
	}, [url]);

	if (error) return <Redirect href="/auth/login" />;

	return (
		<View style={tw`flex-1 items-center justify-center gap-2`}>
			<Icons.Loader />
		</View>
	);
};

export default AuthResetPasswordScreen;