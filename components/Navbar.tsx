import { Tabs } from 'expo-router';
import { Icons } from "@/constants/Icons";
import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from "@/hooks/useColorScheme.web";
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { useMemo } from 'react';

export const Navbar = () => {
	const { session } = useAuth();
	const colorScheme = useColorScheme();
	const routes = useMemo(() => [
		{
		  icon: Icons.home,
		  screen: 'index',
		  label: 'Home',
		},
		{
		  icon: Icons.search,
		  screen: 'search',
		  label: 'Search',
		},
		{
		  icon: Icons.explore,
		  screen: 'explore',
		  label: 'Explore',
		},
		{
			icon: Icons.feed,
			screen: 'feed',
			label: 'Feed',
		},
		{
			icon: session ? Icons.library : Icons.user,
			screen: session ? 'library' : 'auth/login/index',
			label: session ? 'Library' : 'Login',
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
		}}>
		{routes.map((route) => (
			<Tabs.Screen
			key={route.screen}
			name={route.screen}
			options={{
				title: route.label,
				tabBarIcon: ({ color }) => (
				<route.icon size={28} color={color} />
				),
			}}
			/>
		))}
		</Tabs>
	)
};