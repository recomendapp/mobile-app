import { Tabs } from 'expo-router';
import { Icons } from "@/constants/Icons";
import { Platform } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HapticTab } from '@/components/HapticTab';
import { useTheme } from '@/providers/ThemeProvider';
import TabBarBackground from '@/components/TabBar/TabBarBackground';

const TabsLayout = () => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const { t } = useTranslation();
	const routes = useMemo(() => [
		{
		  icon: Icons.home,
		  screen: '(home)',
		  label: t('routes.home'),
		  href: undefined,
		},
		{
		  icon: Icons.Search,
		  screen: '(search)',
		  label: t('routes.search'),
		  href: undefined,
		},
		{
			icon: Icons.Feed,
			screen: '(feed)',
			label: t('routes.feed'),
			href: session ? undefined : null,
		},
		{
			icon: Icons.library,
			screen: '(collection)',
			label: t('routes.library'),
			href: session ? undefined : null,
		},
		{
			icon: Icons.user,
			screen: 'auth',
			label: t('common.word.login'),
			href: session ? null : undefined,
		}
	], [session]);
	
	return (
		<Tabs
		screenOptions={{
			tabBarActiveTintColor: colors.tint,
			headerShown: false,
			tabBarButton: HapticTab,
			tabBarBackground: TabBarBackground,
			tabBarStyle: Platform.select({
				ios: {
					position: 'absolute',
				},
				android: {
					backgroundColor: colors.background,
				},
				default: {},
			}),
			lazy: true,
		}}>
		{routes.map((route) => (
			<Tabs.Screen
			key={route.screen}
			name={route.screen}
			options={{
				title: route.label,
				href: route.href,
				tabBarIcon: ({ color }) => (
				<route.icon size={28} color={color} />
				),
			}}
			/>
		))}
		</Tabs>
	)
};

export default TabsLayout;