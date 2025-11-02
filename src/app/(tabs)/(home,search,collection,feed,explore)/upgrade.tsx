import { Keys } from "@/api/keys";
import { AuthCustomerInfoOptions } from "@/api/options/auth";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {  useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { useTranslations } from "use-intl";

const UpgradeScreen = () => {
	const { session } = useAuth();
	const router = useRouter();
	const queryClient = useQueryClient();
	const t = useTranslations();
	const { defaultScreenOptions } = useTheme();

	const onSuccess = async ({ customerInfo } : { customerInfo: CustomerInfo }) => {
		queryClient.setQueryData(AuthCustomerInfoOptions().queryKey, customerInfo);
		session?.user.id && await queryClient.invalidateQueries({
			queryKey: Keys.auth.user(),
		});
		router.canGoBack() && router.back();
	};

	if (!session) return <Redirect href={'/auth/login'} />
	
	return (
	<>
		<Stack.Screen
		options={{
			...defaultScreenOptions,
			headerTitle: upperFirst(t('common.messages.upgrade')),
			headerTransparent: true,
			headerRight: () => <Button icon={Icons.X} size="icon" variant='muted' style={tw`rounded-full`} onPress={() => router.canGoBack() && router.back()} />,
			headerStyle: { backgroundColor: 'transparent' },
		}}
		/>
		<RevenueCatUI.Paywall onPurchaseCompleted={onSuccess} onRestoreCompleted={onSuccess} />
	</>
	)
};

export default UpgradeScreen;