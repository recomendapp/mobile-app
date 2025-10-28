import { useTheme } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const NotificationsLayout = () => {
	const t = useTranslations();
	const { defaultScreenOptions } = useTheme();
	return (
		<Stack screenOptions={defaultScreenOptions}>
			<Stack.Screen name="index" options={{ headerTitle: upperFirst(t('common.messages.notification', { count: 2 })) }} />
			<Stack.Screen name="follow-requests" options={{ headerTitle: upperFirst(t('common.messages.follow_requests')) }} />
		</Stack>
	)
};

export default NotificationsLayout;