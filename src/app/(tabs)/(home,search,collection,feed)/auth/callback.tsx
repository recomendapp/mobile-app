import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { AuthError } from "expo-auth-session";
import { useLinkingURL } from "expo-linking";
import { useEffect, useState } from "react";
import * as Burnt from "burnt";
import { Redirect } from "expo-router";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";

const AuthCallbackScreen = () => {
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

export default AuthCallbackScreen;