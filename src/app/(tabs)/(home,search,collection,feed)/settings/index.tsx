import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { Href, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { LucideIcon } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { Pressable } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

type Route = {
	label: string;
	route: Href;
	icon: LucideIcon;
	authOnly?: boolean;
};

const SettingsScreen = () => {
	const { session } = useAuth();
	const { colors, tabBarHeight, bottomOffset } = useTheme();
	const router = useRouter();
	const t = useTranslations();
	const routes = useMemo((): Route[] => {
		const routes: Route[] = [
			{ label: upperFirst(t('pages.settings.profile.label')), route: '/settings/profile', icon: Icons.User, authOnly: true },
			{ label: upperFirst(t('pages.settings.account.label')), route: '/settings/account', icon: Icons.Lock, authOnly: true },
			{ label: upperFirst(t('pages.settings.subscription.label')), route: '/settings/subscription', icon: Icons.CreditCard, authOnly: true },
			{ label: upperFirst(t('pages.settings.security.label')), route: '/settings/security', icon: Icons.Shield, authOnly: true },
			{ label: upperFirst(t('pages.settings.notifications.label')), route: '/settings/notifications', icon: Icons.Bell, authOnly: true },
			{ label: upperFirst(t('pages.settings.appearance.label')), route: '/settings/appearance', icon: Icons.Eye },
		];
		return routes.filter(route => !route.authOnly || (route.authOnly && session));
	}, [t, session]);

	const renderItem = useCallback(({ item, index }: { item: Route; index: number }) => (
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
			size="fit"
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
	), [colors.muted, routes.length, router]);

	return (
	<>
		<LegendList
		data={routes}
		renderItem={renderItem}
		contentContainerStyle={{
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		keyExtractor={useCallback((_: Route, number: number) => number.toString(), [])}
		scrollIndicatorInsets={{
			bottom: tabBarHeight
		}}
		/>
	</>
	);
};

export default SettingsScreen;