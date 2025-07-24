import { Tabs, useRouter } from 'expo-router';
import { Icons } from "@/constants/Icons";
import { Platform } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/TabBar/TabBarBackground';

const TabsLayout = () => {
	const { session } = useAuth();
	const { colors } = useTheme();
	const { t } = useTranslation();
	const router = useRouter();
	return (
		<Tabs
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
				lazy: true,
			}}
		>
			<Tabs.Screen
				name="(home)"
				options={{
					title: t('routes.home'),
					tabBarIcon: ({ color }) => <Icons.home size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="(search)"
				options={{
					title: t('routes.search'),
					tabBarIcon: ({ color }) => <Icons.Search size={28} color={color} />,
				}}
			/>

			{/* LOGIN ONLY */}
			<Tabs.Protected guard={!!session}>
				<Tabs.Screen
					name="(feed)"
					options={{
						title: t('routes.feed'),
						tabBarIcon: ({ color }) => <Icons.Feed size={28} color={color} />,
					}}
				/>
				<Tabs.Screen
					name="(collection)"
					options={{
						title: t('routes.library'),
						tabBarIcon: ({ color }) => <Icons.library size={28} color={color} />,
					}}
				/>
			</Tabs.Protected>

			{/* ANON ONLY */}
			<Tabs.Protected guard={!session}>
				<Tabs.Screen
				name='auth'
				options={{
					title: t('common.word.login'),
					tabBarIcon: ({ color }) => <Icons.User size={28} color={color} />,
				}}
				listeners={() => ({
					tabPress: (e) => {
						e.preventDefault();
						router.push('/auth');
					},
				})}
				/>
			</Tabs.Protected>
		</Tabs>
	);
};

export default TabsLayout;
