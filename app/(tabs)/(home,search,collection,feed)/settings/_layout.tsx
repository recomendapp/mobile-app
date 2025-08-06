
import { Button } from "@/components/ui/Button";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { UserNav } from "@/components/user/UserNav";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { useEffect, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import Header from "@/components/header/Header";

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

const TabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
	const flatListRef = useRef<FlatList>(null);

	useEffect(() => {
		onPressTab(state.routes[state.index], state.index, true);
	}, [state.index]);

	const onPressTab = (item: typeof state.routes[0], index: number, isFocused: boolean) => {
		const event = navigation.emit({
			type: 'tabPress',
			target: item.key,
			canPreventDefault: true,
		});

		if (!isFocused && !event.defaultPrevented) {
			navigation.navigate(item.name);
		}

		flatListRef.current?.scrollToIndex({ index, animated: true });
	};

  return (
    <View>
      <Animated.FlatList
        ref={flatListRef}
        data={state.routes}
        renderItem={({ item, index }) => {
          const { options } = descriptors[item.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title || item.name;
          const isFocused = state.index === index;

          return (
            <Button
              variant={isFocused ? 'default' : 'outline'}
              style={tw`rounded-full`}
              onPress={() => onPressTab(item, index, isFocused)}
            >
              {upperFirst(label)}
            </Button>
          );
        }}
        keyExtractor={(item) => item.key}
        contentContainerStyle={tw`gap-2 px-2 py-1`}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const SettingsLayout = () => {
	const t = useTranslations();
	const { colors } = useTheme();
	return (
	<MaterialTopTabs
	tabBar={(props) => <TabBar {...props} />}
	screenLayout={(props) => {
		return (
			<Animated.ScrollView contentContainerStyle={tw`px-4 gap-4`}>
				<View>
					<Text style={tw`text-lg font-medium`}>{props.options.title}</Text>
					<Text variant="muted" style={tw`text-sm text-justify`}>{t(`pages.settings.${props.route.name}.description`)}</Text>	
				</View>
				<View style={[{ backgroundColor: colors.muted, borderRadius: 9999 }, tw`h-1`]} />
				{props.children}
			</Animated.ScrollView>
		)
	}}
	>
		<MaterialTopTabs.Screen name="profile" options={{ title: upperFirst(t('pages.settings.profile.label')) }} />
		<MaterialTopTabs.Screen name="account" options={{ title: upperFirst(t('pages.settings.account.label')) }} />
		<MaterialTopTabs.Screen name="appearance" options={{ title: upperFirst(t('pages.settings.appearance.label')) }} />
		<MaterialTopTabs.Screen name="subscription" options={{ title: upperFirst(t('pages.settings.subscription.label')) }} />
		<MaterialTopTabs.Screen name="security" options={{ title: upperFirst(t('pages.settings.security.label')) }} />
		<MaterialTopTabs.Screen name="notifications" options={{ title: upperFirst(t('pages.settings.notifications.label')) }} />
	</MaterialTopTabs> 
	)
};

export default SettingsLayout;