
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
		<ThemedSafeAreaView style={tw`flex-1`}>
			<Header
			right={upperFirst(t('pages.settings.label'))}
			left={<UserNav />}
			/>
			<MaterialTopTabs
			tabBar={(props) => <TabBar {...props} />}
			screenLayout={(props) => {
				const name = props.route.name;
				return (
					<Animated.ScrollView contentContainerStyle={tw`p-2 gap-4`}>
						<View>
							<Text style={tw`text-lg font-medium`}>{t(`pages.settings.${props.route.name}.label`)}</Text>
							<Text variant="muted" style={tw`text-sm text-justify`}>{t(`pages.settings.${props.route.name}.description`)}</Text>	
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