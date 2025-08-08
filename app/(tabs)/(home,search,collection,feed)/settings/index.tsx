import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { LegendList } from "@legendapp/list";
import { Href, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { LucideIcon } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const SettingsScreen = () => {
	const { session } = useAuth();
	const { colors, bottomTabHeight } = useTheme();
	const router = useRouter();
	const t = useTranslations();
	const routes = useMemo((): { label: string, route: Href, icon: LucideIcon, needsAuth?: boolean }[] => [
		{ label: upperFirst(t('pages.settings.profile.label')), route: '/settings/profile', icon: Icons.User, needsAuth: true },
		{ label: upperFirst(t('pages.settings.account.label')), route: '/settings/account', icon: Icons.Lock, needsAuth: true },
		{ label: upperFirst(t('pages.settings.subscription.label')), route: '/settings/subscription', icon: Icons.CreditCard, needsAuth: true },
		{ label: upperFirst(t('pages.settings.security.label')), route: '/settings/security', icon: Icons.Shield, needsAuth: true },
		{ label: upperFirst(t('pages.settings.notifications.label')), route: '/settings/notifications', icon: Icons.Bell, needsAuth: true },
		{ label: upperFirst(t('pages.settings.appearance.label')), route: '/settings/appearance', icon: Icons.Eye },
	], [t]);

	return (
	<>
		<LegendList
		data={routes.filter(route => !route.needsAuth || session)}
		renderItem={({ item, index }) => (
			<Pressable
			onPress={() => router.push(item.route)}
			style={[
				{ borderColor: colors.muted },
				tw`flex-1 flex-row justify-between items-center gap-2 p-4`,
				index < routes.length - 1 ? tw`border-b` : null,
			]}
			>
				<Button
				variant="ghost"
				style={tw`p-0`}
				icon={item.icon}
				>
					{item.label}
				</Button>
				<Button
				variant="ghost"
				icon={Icons.ChevronRight}
				size="icon"
				/>
			</Pressable>
		)}
		contentContainerStyle={{
			paddingBottom: bottomTabHeight + 8,
		}}
		keyExtractor={(item) => item.label}
		/>
	</>
	);
};

export default SettingsScreen;