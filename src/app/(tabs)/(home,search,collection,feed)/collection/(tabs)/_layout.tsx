
import ButtonCreatePlaylist from "@/components/buttons/ButtonCreatePlaylist";
import { Button } from "@/components/ui/Button";
import { UserNav } from "@/components/user/UserNav";
import tw from "@/lib/tw";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute, ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack, withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Tab.Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Tab.Navigator);

const TabBar = ({ state, descriptors, navigation } : MaterialTopTabBarProps) => {
	const flatListRef = useRef<FlatList>(null);
	
	useEffect(() => {
		onPressTab(state.routes[state.index], state.index, true);
	}, [state.index]);

	const onPressTab = useCallback((item: typeof state.routes[0], index: number, isFocused: boolean) => {
		const event = navigation.emit({
			type: 'tabPress',
			target: item.key,
			canPreventDefault: true,
		});

		if (!isFocused && !event.defaultPrevented) {
			navigation.navigate(item.name);
		}

		flatListRef.current?.scrollToIndex({ index, animated: true });
	}, [navigation]);

	const renderItem = useCallback(({ item, index } : { item: NavigationRoute<ParamListBase, string>, index: number }) => {
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
				{upperFirst(label)}
			</Button>
		);
	}, [descriptors, navigation, state.index]);
	const keyExtractor = useCallback((item: NavigationRoute<ParamListBase, string>) => item.key, []);
	return (
		<View>
			<Animated.FlatList
			ref={flatListRef}
			data={state.routes}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			contentContainerStyle={{
				gap: GAP,
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: GAP,
			}}
			horizontal
			showsHorizontalScrollIndicator={false}
			/>
		</View>
	)
};

const CollectionLayout = () => {
	const t = useTranslations();
	const { colors } = useTheme();
	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: () => <></>,
			title: upperFirst(t('common.messages.library')),
			headerLeft: () => (
			<View style={tw`flex-row items-center gap-1`}>
				<HeaderTitle tintColor={colors.foreground}>{upperFirst(t('common.messages.library'))}</HeaderTitle>
			</View>
			),
			headerRight: () => (
			<View style={tw`flex-row items-center gap-1`}>
				<ButtonCreatePlaylist variant="ghost" size="icon" redirectAfterCreate={false} />
				<UserNav />
			</View>
			)
		}}
		/>
		<MaterialTopTabs
		tabBar={(props) => <TabBar {...props} />}
		>
			<MaterialTopTabs.Screen name="index" options={{ title: "perso" }} />
			<MaterialTopTabs.Screen name="saved" options={{ title: upperFirst(t('common.messages.saved', { gender: 'female', count: 2 })) }} />
		</MaterialTopTabs> 
	</>
	)
};

export default CollectionLayout;