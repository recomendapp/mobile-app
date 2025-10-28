
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_VERTICAL } from "@/theme/globals";
import RevenueCatUI from "react-native-purchases-ui";
import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";

const SettingsSubscriptionScreen = () => {
	const router = useRouter();
	const { bottomOffset } = useTheme();
	const onDimiss = useCallback(() => {
		router.canGoBack() && router.back();
	}, [router]);
	return (
	<>
		<Stack.Screen options={{ headerShown: false }} /> 
		<RevenueCatUI.CustomerCenterView
		onDismiss={onDimiss}
		style={{
			flex: 1,
			gap: GAP,
			paddingBottom: bottomOffset + PADDING_VERTICAL
		}}
		/>
	</>
	)
};

export default SettingsSubscriptionScreen;