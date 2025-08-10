import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Stack } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const UpgradeScreen = () => {
	const t = useTranslations();
	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.upgrade_to_plan', { plan: 'Premium' })),
			}}
		/>
		<View>
			<Text>Upgrade screen</Text>
		</View>
	</>
	)
};

export default UpgradeScreen;