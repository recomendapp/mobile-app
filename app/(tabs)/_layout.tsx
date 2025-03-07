import { Tabs } from 'expo-router';
import { Icons } from "@/constants/Icons";
import { Colors } from '@/constants/Colors';
import TabBarBackground from '@/components/TabBarBackground';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { useMemo } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';
import { HapticTab } from '@/components/HapticTab';

const TabsLayout = () => {
	const { session } = useAuth();
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const routes = useMemo(() => [
		{
		  icon: Icons.home,
		  screen: '(home)',
		  label: t('routes.home'),
		  href: undefined,
		},
		{
		  icon: Icons.search,
		  screen: '(search)',
		  label: t('routes.search'),
		  href: undefined,
		},
		// {
		//   icon: Icons.explore,
		//   screen: 'explore',
		//   label: 'Explore',
		// },
		// {
		// 	icon: Icons.feed,
		// 	screen: 'feed',
		// 	label: 'Feed',
		// },
		// {
		// 	icon: session ? Icons.library : Icons.user,
		// 	screen: session ? 'collection' : 'auth/login',
		// 	label: session ? 'Library' : 'Login',
		// }
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
			tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
			headerShown: false,
			tabBarButton: HapticTab,
			tabBarBackground: TabBarBackground,
			tabBarStyle: Platform.select({
			ios: {
				// Use a transparent background on iOS to show the blur effect
				position: 'absolute',
			},
			default: {},
			}),
			// sceneStyle: {
			// 	paddingBottom: 83,
			// }
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