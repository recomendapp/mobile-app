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
	const { colors, isLiquidGlassAvailable } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	const hasOnboarded = useUIStore(state => state.hasOnboarded);
	const segment = useSegments();

	useEffect(() => {
		if (!hasOnboarded && !segment.some((seg) => seg === 'onboarding')) {
			router.replace({ pathname: '/onboarding' });
		}
	}, [hasOnboarded, router, segment]);

	// return (
	// 	<NativeTabs
	// 	iconColor={isLiquidGlassAvailable ? colors.accentYellow : colors.mutedForeground}
	// 	tintColor={colors.accentYellow}
	// 	backgroundColor={Platform.select({
	// 		android: colors.muted,
	// 		default: undefined
	// 	})}
	// 	indicatorColor={'transparent'}
	// 	disableTransparentOnScrollEdge
	//   	>
	// 		<NativeTabs.Trigger name='(home)'>
	// 			<Label>{upperFirst(t('common.messages.home'))}</Label>
	// 			<Icon sf={{ default: 'house', selected: 'house.fill' }} drawable='home' />
	// 		</NativeTabs.Trigger>
	// 		<NativeTabs.Trigger name='(search)'>
	// 			<Label>{upperFirst(t('common.messages.search'))}</Label>
	// 			<Icon sf={'magnifyingglass'} drawable='search' />
	// 		</NativeTabs.Trigger>

	// 		{/* LOGIN ONLY */}
	// 		<Tabs.Protected guard={!!session}>
	// 			<NativeTabs.Trigger name='(feed)'>
	// 				<Label>{upperFirst(t('common.messages.feed'))}</Label>
	// 				<Icon sf={'text.justify'} drawable='feed' />
	// 			</NativeTabs.Trigger>
	// 			<NativeTabs.Trigger name='(collection)'>
	// 				<Label>{upperFirst(t('common.messages.library'))}</Label>
	// 				<Icon sf={'books.vertical.fill'} drawable='library' />
	// 			</NativeTabs.Trigger>
	// 		</Tabs.Protected>

	// 		{/* ANON ONLY */}
	// 		<Tabs.Protected guard={!session}>
	// 			<NativeTabs.Trigger name='auth'>
	// 				<Label>{upperFirst(t('common.messages.login'))}</Label>
	// 				<Icon sf={'person.crop.circle'} />
	// 			</NativeTabs.Trigger>
	// 		</Tabs.Protected>
	// 	</NativeTabs>
	// );

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
					android: { backgroundColor: colors.background },
					default: {},
				}),
				position: 'absolute',
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
