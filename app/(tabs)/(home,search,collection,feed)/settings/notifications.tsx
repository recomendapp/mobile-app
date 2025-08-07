import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { useNotifications } from "@/providers/NotificationsProvider";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";
import { upperFirst } from "lodash";
import { Linking, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";

const SettingsNotificationsScreen = () => {
	const t = useTranslations();
	const { colors, bottomTabHeight } = useTheme();
	const { permissionStatus } = useNotifications();
	const openAppSettings = () => {
        Linking.openSettings();
    };
	return (
	<>
		<ScrollView
		contentContainerStyle={[
			tw`gap-2 p-4`,
			{ paddingBottom: bottomTabHeight + 8 }
		]}
		>
		<View style={tw`flex-row items-center justify-between gap-2`}>
			<Label>{upperFirst(t('pages.settings.notifications.push_notifications.label'))}</Label>
			{1 && (
				<Button onPress={openAppSettings}>{upperFirst(t('common.messages.open_settings'))}</Button>
			)}
		</View>
		</ScrollView>
	</>
	)
};

export default SettingsNotificationsScreen;