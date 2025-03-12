import { Link, LinkProps, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, Text, View } from "react-native";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";

const NavSettings = () => {
	const { t } = useTranslation();
	const pathname = usePathname();

	const NavSettingsItems: { title: string; href: LinkProps['href'] }[] = [
		{
		title: t('profile.label'),
		href: '/settings/profile',
		},
		{
		title: t('account.label'),
		href: '/settings/account',
		},
		{
		title: t('appearance.label'),
		href: '/settings/appearance',
		},
		{
		title: t('subscription.label'),
		href: '/settings/subscription',
		},
		// {
		// title: t('security.label'),
		// href: '/settings/security',
		// },
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
			contentContainerStyle={tw.style('gap-2')}
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
			<Pressable style={[tw.style('rounded-full'), active && { backgroundColor: colors.muted }]}>
				<Text>{title}</Text>
			</Pressable>
		</Link>
	)
};

export { NavSettings };