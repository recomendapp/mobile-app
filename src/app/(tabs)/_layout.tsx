import { Tabs, useRouter, useSegments } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Icons } from "@/constants/Icons";
import { Platform } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/TabBar/TabBarBackground';
import { useTranslations } from 'use-intl';
import { upperFirst } from 'lodash';
import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

const TabsLayout = () => {
	const { session } = useAuth();
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	const hasOnboarded = useUIStore(state => state.hasOnboarded);
	const segment = useSegments();
	const hideTabBarRoutes = ['(explore)', 'onboarding'];
	// return (
	// 	<NativeTabs iconColor={colors.muted} tintColor={colors.tint}>
	// 		<NativeTabs.Trigger name='(home)'>
	// 			<Label>{upperFirst(t('common.messages.home'))}</Label>
	// 			<Icon sf={'house.fill'} drawable='ic_menu_mylocation' />
	// 		</NativeTabs.Trigger>
	// 		<NativeTabs.Trigger name='(search)'>
	// 			<Label>{upperFirst(t('common.messages.search'))}</Label>
	// 			<Icon sf={'magnifyingglass'} drawable='ic_menu_mylocation' />
	// 		</NativeTabs.Trigger>

	// 		<NativeTabs.Trigger name='(explore)'>
	// 			<Label>{upperFirst(t('common.messages.explore'))}</Label>
	// 			<Icon sf={'map.fill'} drawable='ic_menu_mylocation' />
	// 		</NativeTabs.Trigger>

	// 		{/* LOGIN ONLY */}
	// 		<Tabs.Protected guard={!!session}>
	// 			<NativeTabs.Trigger name='(feed)'>
	// 				<Label>{upperFirst(t('common.messages.feed'))}</Label>
	// 				<Icon sf={'text.justify'} drawable='ic_menu_mylocation' />
	// 			</NativeTabs.Trigger>
	// 			<NativeTabs.Trigger name='(collection)'>
	// 				<Label>{upperFirst(t('common.messages.library'))}</Label>
	// 				<Icon sf={'books.vertical.fill'} drawable='ic_menu_mylocation' />
	// 			</NativeTabs.Trigger>
	// 		</Tabs.Protected>

	// 		{/* ANON ONLY */}
	// 		<Tabs.Protected guard={!session}>
	// 			<NativeTabs.Trigger name='auth'>
	// 				<Label>{upperFirst(t('common.messages.login'))}</Label>
	// 				<Icon sf={'person.crop.circle'} drawable='ic_menu_mylocation' />
	// 			</NativeTabs.Trigger>
	// 		</Tabs.Protected>
	// 	</NativeTabs>
	// )

	useEffect(() => {
		if (!hasOnboarded && !segment.some((seg) => seg === 'onboarding')) {
			router.replace({ pathname: '/onboarding' });
		}
	}, [hasOnboarded, router, segment]);

	return (
	<Tabs
		initialRouteName='(home)'
		screenOptions={{
			tabBarActiveTintColor: colors.tint,
			headerShown: false,
			tabBarButton: HapticTab,
			tabBarBackground: TabBarBackground,
			tabBarStyle: {
				...Platform.select({
					ios: { position: 'absolute' },
					android: { backgroundColor: colors.background },
					default: {},
				}),
				display: segment.some((seg) => hideTabBarRoutes.includes(seg)) ? 'none' : 'flex',
			},
			tabBarItemStyle: {
				paddingTop: 4,
			},
			tabBarShowLabel: false,
			lazy: true,
		}}
	>
		<Tabs.Screen
			name="(home)"
			options={{
				title: upperFirst(t('common.messages.home')),
				tabBarIcon: ({ color }) => <Icons.home size={28} color={color} />,
			}}
		/>
		<Tabs.Screen
			name="(search)"
			options={{
				title: upperFirst(t('common.messages.search')),
				tabBarIcon: ({ color }) => <Icons.Search size={28} color={color} />,
			}}
		/>

		<Tabs.Screen
		name='(explore)'
		options={{
			title: upperFirst(t('common.messages.explore')),
			tabBarIcon: ({ color }) => <Icons.Explore size={28} color={color} />,
		}}
		/>

		{/* LOGIN ONLY */}
		<Tabs.Protected guard={!!session}>
			<Tabs.Screen
				name="(feed)"
				options={{
					title: upperFirst(t('common.messages.feed')),
					tabBarIcon: ({ color }) => <Icons.Feed size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="(collection)"
				options={{
					title: upperFirst(t('common.messages.library')),
					tabBarIcon: ({ color }) => <Icons.library size={28} color={color} />,
				}}
			/>
		</Tabs.Protected>

		{/* ANON ONLY */}
		<Tabs.Protected guard={!session}>
			<Tabs.Screen
			name='auth'
			options={{
				title: upperFirst(t('common.messages.login')),
				tabBarIcon: ({ color }) => <Icons.User size={28} color={color} />,
			}}
			listeners={() => ({
				tabPress: (e) => {
					e.preventDefault();
					router.push('/auth');
				}
			})}
			/>
		</Tabs.Protected>

	</Tabs>
	);
};

export default TabsLayout;
