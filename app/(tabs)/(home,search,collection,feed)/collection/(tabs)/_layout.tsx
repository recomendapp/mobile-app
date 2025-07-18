
import ButtonCreatePlaylist from "@/components/buttons/ButtonCreatePlaylist";
import { Button, ButtonText } from "@/components/ui/Button";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { UserNav } from "@/components/user/UserNav";
import tw from "@/lib/tw";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated from "react-native-reanimated";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Tab.Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Tab.Navigator);

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

const CollectionLayout = () => {
	const { t } = useTranslation();
	return (
		<ThemedSafeAreaView style={tw.style('flex-1')}>
			<View style={tw.style('flex-row justify-between items-center gap-2 p-2')}>
				<View style={tw`flex-row items-center gap-2`}>
					<ThemedText style={tw`text-2xl font-bold`}>{upperFirst(t('common.messages.library'))}</ThemedText>
					<ButtonCreatePlaylist redirectAfterCreate={false} />
				</View>
				<UserNav />
			</View>
			<MaterialTopTabs
			tabBar={(props) => <TabBar {...props} />}
			screenLayout={(props) => (
				<View style={tw`flex-1 p-2`}>
					{props.children}
				</View>
			)}
			>
				<MaterialTopTabs.Screen name="index" options={{ title: "perso" }} />
				<MaterialTopTabs.Screen name="saved" options={{ title: upperFirst(t('common.word.saved')) }} />
			</MaterialTopTabs> 
		</ThemedSafeAreaView>
	)
};

export default CollectionLayout;