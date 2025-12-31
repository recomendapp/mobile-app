import { Keys } from "@/api/keys";
import { useAuthCustomerInfoOptions } from "@/api/options";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { isIOS } from "@/platform/detection";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {  useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback } from "react";
import { CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { useTranslations } from "use-intl";

const UpgradeScreen = () => {
	const { session } = useAuth();
	const router = useRouter();
	const queryClient = useQueryClient();
	const t = useTranslations();
	const { defaultScreenOptions, isLiquidGlassAvailable } = useTheme();
	const authCustomerInfoOptions = useAuthCustomerInfoOptions();

	const onSuccess = useCallback(async ({ customerInfo } : { customerInfo: CustomerInfo }) => {
		queryClient.setQueryData(authCustomerInfoOptions.queryKey, customerInfo);
		session?.user.id && await queryClient.invalidateQueries({
			queryKey: Keys.auth.user(),
		});
		router.canGoBack() && router.back();
	}, [queryClient, authCustomerInfoOptions.queryKey, router, session?.user.id]);

	const handleClose = useCallback(() => {
		router.canGoBack() && router.back();
	}, [router]);

	if (!session) return <Redirect href={'/auth/login'} />
	
	return (
	<>
		<Stack.Screen
		options={{
			...defaultScreenOptions,
			headerTitle: upperFirst(t('common.messages.upgrade')),
			headerTransparent: true,
			headerStyle: { backgroundColor: 'transparent' },
			headerLeft: () => (
				<Button variant="muted" icon={Icons.X} size="icon" style={tw`rounded-full`} onPress={handleClose} />
			),
			unstable_headerLeftItems: isLiquidGlassAvailable ? (props) => [
			{
				type: "button",
				label: upperFirst(t('common.messages.close')),
				onPress: handleClose,
				icon: {
					name: "xmark",
					type: "sfSymbol",
				},
			},
			] : undefined,
		}}
		/>
		<RevenueCatUI.Paywall onPurchaseCompleted={onSuccess} onRestoreCompleted={onSuccess} />
	</>
	)
};

export default UpgradeScreen;