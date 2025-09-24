import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { useNotifications } from "@/providers/NotificationsProvider";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";
import { upperFirst } from "lodash";
import { Linking, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";

const SettingsNotificationsScreen = () => {
	const t = useTranslations();
	const { tabBarHeight, bottomTabHeight } = useTheme();
	const { permissionStatus } = useNotifications();
	const openAppSettings = () => {
        Linking.openSettings();
    };
	return (
	<>
		<ScrollView
		contentContainerStyle={[
			{
				gap: GAP,
				paddingTop: PADDING_VERTICAL,
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		scrollIndicatorInsets={{
			bottom: tabBarHeight
		}}
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