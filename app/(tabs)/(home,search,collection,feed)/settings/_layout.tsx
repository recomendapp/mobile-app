
import { Button, ButtonText } from "@/components/ui/Button";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { UserNav } from "@/components/user/UserNav";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

const TabBar = ({ state, descriptors, navigation, position } : MaterialTopTabBarProps) => {
	return (
		<View>
			<Animated.FlatList
			data={state.routes}
			renderItem={({ item, index }) => {
				const { options } = descriptors[item.key];
				const label =
				(options.tabBarLabel !== undefined && typeof options.tabBarLabel === 'string')
					? options.tabBarLabel
					: options.title !== undefined
					? options.title
					: item.name;
				const isFocused = state.index === index;
				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: item.key,
						canPreventDefault: true,
					});
					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(item.name);
					}
				};
				return (
					<Button
					variant={isFocused ? 'default' : 'outline'}
					style={{ borderRadius: 9999}}
					onPress={onPress}
					>
						<ButtonText
						variant={isFocused ? 'default' : 'outline'}
						>
							{upperFirst(label)}
						</ButtonText>
					</Button>
				);
			}}
			contentContainerStyle={tw`gap-2 px-2`}
			horizontal
			keyExtractor={(item) => item.key}
			showsHorizontalScrollIndicator={false}
			/>
		</View>
	)
};

const SettingsLayout = () => {
	const { t } = useTranslation();
	const { colors } = useTheme();
	return (
		<ThemedSafeAreaView style={tw.style('flex-1')}>
			<View style={tw.style('flex-row justify-between items-center gap-2 p-2')}>
				<ThemedText style={tw.style('text-4xl font-bold')}>Settings</ThemedText>
				<UserNav />
			</View>
			<MaterialTopTabs
			tabBar={(props) => <TabBar {...props} />}
			screenLayout={(props) => {
				const name = props.route.name;
				return (
					<Animated.ScrollView contentContainerStyle={tw`p-2 gap-4`}>
						<View>
							<ThemedText style={tw`text-lg font-medium`}>{t(`pages.settings.${props.route.name}.label`)}</ThemedText>
							<Text style={[{ color: colors.mutedForeground }, tw`text-sm text-justify`]}>{t(`pages.settings.${props.route.name}.description`)}</Text>	
						</View>
						<View style={[{ backgroundColor: colors.muted, borderRadius: 9999 }, tw`h-1`]} />
						{props.children}
					</Animated.ScrollView>
				)
			}}
			>
				<MaterialTopTabs.Screen name="profile" options={{ title: t('pages.settings.profile.label') }} />
				<MaterialTopTabs.Screen name="account" options={{ title: t('pages.settings.account.label') }} />
				<MaterialTopTabs.Screen name="appearance" options={{ title: t('pages.settings.appearance.label') }} />
				<MaterialTopTabs.Screen name="subscription" options={{ title: t('pages.settings.subscription.label') }} />
				<MaterialTopTabs.Screen name="security" options={{ title: t('pages.settings.security.label') }} />
			</MaterialTopTabs> 
		</ThemedSafeAreaView>
	)
};

export default SettingsLayout;