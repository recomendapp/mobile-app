import { Link, LinkProps, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";
import { Button, ButtonText } from "../ui/Button";

const NavSettings = () => {
	const { t } = useTranslation();
	const pathname = usePathname();

	const NavSettingsItems: { title: string; href: LinkProps['href'] }[] = [
		{
		title: t('pages.settings.profile.label'),
		href: '/settings/profile',
		},
		{
		title: t('pages.settings.account.label'),
		href: '/settings/account',
		},
		{
		title: t('pages.settings.appearance.label'),
		href: '/settings/appearance',
		},
		{
		title: t('pages.settings.subscription.label'),
		href: '/settings/subscription',
		},
		{
		title: t('pages.settings.security.label'),
		href: '/settings/security',
		},
		// {
		// title: t('notifications.label'),
		// href: '/settings/notifications',
		// },
		// {
		// title: t('data.label'),
		// href: '/settings/data',
		// },
	];
	return (
		<View>
			<FlatList
			data={NavSettingsItems}
			contentContainerStyle={tw.style('gap-2 px-2')}
			renderItem={({ item }) => (
				<NavSettingsItem title={item.title} href={item.href} active={pathname === item.href} />
			)}
			horizontal
			showsHorizontalScrollIndicator={false}
			/>
		</View>
	)
};

const NavSettingsItem = ({
	title,
	href,
	active,
}: {
	title: string;
	href: LinkProps['href'];
	active?: boolean;
}) => {
	const { colors } = useTheme();
	return (
		<Link
		href={href}
		asChild
		>
			<Button variant={active ? 'default' : 'outline'} style={{ borderRadius: 9999}}>
				<ButtonText variant={active ? 'default' : 'outline'}>{title}</ButtonText>
			</Button>
		</Link>
	)
};

export { NavSettings };