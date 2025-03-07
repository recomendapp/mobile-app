import { Link, LinkProps, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import { Button, buttonTextVariants } from "../ui/button";
import { cn } from "@/lib/utils";

const SettingsNav = () => {
	const { t } = useTranslation();
	const pathname = usePathname();

	const settingsNavItems: { title: string; href: LinkProps['href'] }[] = [
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
			data={settingsNavItems}
			contentContainerClassName="gap-2"
			renderItem={({ item }) => (
				<SettingsNavItem title={item.title} href={item.href} active={pathname === item.href} />
			)}
			horizontal
			showsHorizontalScrollIndicator={false}
			/>
		</View>
	)
};

const SettingsNavItem = ({
	title,
	href,
	active,
}: {
	title: string;
	href: LinkProps['href'];
	active?: boolean;
}) => {
	return (
		<Link
		href={href}
		asChild
		>
			<Button variant={'outline'} className={cn("rounded-full", active ? 'bg-muted' : '')}>
				<Text className={buttonTextVariants({ variant: active ? 'secondary' : 'outline'})}>{title}</Text>
			</Button>
		</Link>
	)
};

export { SettingsNav };