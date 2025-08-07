import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import Animated from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { useNotifications } from "@/providers/NotificationsProvider";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";
import { upperFirst } from "lodash";

const SettingsNotificationsScreen = () => {
	const t = useTranslations();
	const { colors } = useTheme();
	const { permissionStatus } = useNotifications();
	return (
	<>
		<View style={tw`gap-2`}>
			<Label>{upperFirst(t('pages.settings.notifications.push_notifications.label'))}</Label>
			<Text variant="muted" style={tw`text-sm text-justify`}>
				{permissionStatus}
			</Text>
		</View>
	</>
	)
};

export default SettingsNotificationsScreen;