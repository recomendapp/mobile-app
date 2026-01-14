import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { View } from "react-native";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Tab.Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Tab.Navigator);

const TabBar = ({ state, descriptors, navigation } : MaterialTopTabBarProps) => {
	const onPressTab = (item: typeof state.routes[number], index: number, isFocused: boolean) => {
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
	<View style={{ paddingHorizontal: PADDING_HORIZONTAL, paddingBottom: PADDING_VERTICAL }}>
		<SegmentedControl
		values={state.routes.map(option => {
			const { options } = descriptors[option.key];
			const label = (options.tabBarLabel !== undefined && typeof options.tabBarLabel === 'string')
					? options.tabBarLabel
					: options.title !== undefined
					? options.title
					: option.name;
			return upperFirst(label);
		})}
		selectedIndex={state.index}
		onChange={(event) => onPressTab(state.routes[event.nativeEvent.selectedSegmentIndex], event.nativeEvent.selectedSegmentIndex, false)}
		/>
	</View>
	)
};

const FeedLayout = () => {
	const t = useTranslations();
	return (
	<MaterialTopTabs
	initialRouteName="index"
	tabBar={(props) => <TabBar {...props} />}
	>
		<MaterialTopTabs.Screen name="index" options={{ title: upperFirst(t('common.messages.community')) }} />
		<MaterialTopTabs.Screen name="cast-crew" options={{ title: upperFirst(t('common.messages.cast_and_crew')) }} />
	</MaterialTopTabs>
	)
};

export default FeedLayout;