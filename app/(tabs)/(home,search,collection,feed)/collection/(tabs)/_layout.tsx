
import ButtonCreatePlaylist from "@/components/buttons/ButtonCreatePlaylist";
import { Button } from "@/components/ui/Button";
import { UserNav } from "@/components/user/UserNav";
import tw from "@/lib/tw";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack, withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useTranslations } from "use-intl";

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
			}}
			keyExtractor={(item) => item.key}
			contentContainerStyle={tw`gap-2 px-4 py-1`}
			horizontal
			showsHorizontalScrollIndicator={false}
			/>
		</View>
	)
};

const CollectionLayout = () => {
	const t = useTranslations();
	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: upperFirst(t('common.messages.library')),
			headerRight: () => (
			<View style={tw`flex-row items-center gap-2`}>
				<ButtonCreatePlaylist redirectAfterCreate={false} />
				<UserNav />
			</View>
			),
		}}
		/>
		<MaterialTopTabs
		tabBar={(props) => <TabBar {...props} />}
		screenLayout={(props) => (
			<View style={tw`flex-1 py-2 px-4`}>
				{props.children}
			</View>
		)}
		>
			<MaterialTopTabs.Screen name="index" options={{ title: "perso" }} />
			<MaterialTopTabs.Screen name="saved" options={{ title: upperFirst(t('common.messages.saved', { gender: 'female', count: 2 })) }} />
		</MaterialTopTabs> 
	</>
	)
};

export default CollectionLayout;