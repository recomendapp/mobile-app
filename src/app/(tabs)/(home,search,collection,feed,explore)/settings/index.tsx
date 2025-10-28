import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { Href, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { LucideIcon } from "lucide-react-native";
import { useCallback, useMemo } from "react";
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
		<Button
		variant="ghost"
		size="fit"
		icon={item.icon}
		onPress={() => router.push(item.route)}
		style={[
			{ paddingVertical: PADDING_HORIZONTAL, paddingHorizontal: PADDING_HORIZONTAL, borderColor: colors.muted },
			index < routes.length - 1 ? tw`border-b` : tw``,
		]}
		>
			<View style={tw`flex-1 flex-row items-center gap-2 justify-between`}>
				<Text>{item.label}</Text>
				<Icons.ChevronRight color={colors.mutedForeground} size={16} />
			</View>
		</Button>
	), [colors.muted, colors.mutedForeground, router, routes.length]);

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