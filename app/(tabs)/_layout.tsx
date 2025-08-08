import { Tabs, useRouter } from 'expo-router';
import { Icons } from "@/constants/Icons";
import { Platform } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/TabBar/TabBarBackground';
import { useTranslations } from 'use-intl';
import { upperFirst } from 'lodash';

const TabsLayout = () => {
	const { session } = useAuth();
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	return (
	<Tabs
		initialRouteName='(home)'
		screenOptions={{
			tabBarActiveTintColor: colors.tint,
			headerShown: false,
			tabBarButton: HapticTab,
			tabBarBackground: TabBarBackground,
			tabBarStyle: Platform.select({
				ios: { position: 'absolute' },
				android: { backgroundColor: colors.background },
				default: {},
			}),
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
