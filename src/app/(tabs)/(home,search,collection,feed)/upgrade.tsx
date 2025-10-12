import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { authKeys } from "@/features/auth/authKeys";
import { userKeys } from "@/features/user/userKeys";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {  useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import RevenueCatUI from "react-native-purchases-ui";
import { useTranslations } from "use-intl";

const UpgradeScreen = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const t = useTranslations();
	const { session } = useAuth();
	const { defaultScreenOptions } = useTheme();
	const screenOptions = useMemo(() => ({
		...defaultScreenOptions,
		headerTitle: upperFirst(t('common.messages.upgrade')),
		headerTransparent: true,
		headerRight: () => <Button icon={Icons.X} size="icon" variant='muted' style={tw`rounded-full`} onPress={() => router.canGoBack() && router.back()} />,
		headerStyle: { backgroundColor: 'transparent' },
	}), [defaultScreenOptions, t]);
	
	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: authKeys.customerInfo(),
		});
		session?.user.id && await queryClient.invalidateQueries({
			queryKey: userKeys.detail(session.user.id),
		});
		router.canGoBack() && router.back();
	}, [router]);

	if (!session) {
		return <Redirect href={'/auth/login'} />;
	}
	return (
	<>
		<Stack.Screen options={screenOptions} />
		<RevenueCatUI.Paywall onPurchaseCompleted={onSuccess} onRestoreCompleted={onSuccess} />
	</>
	)
};

export default UpgradeScreen;