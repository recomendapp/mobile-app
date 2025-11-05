import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack, useLocalSearchParams, withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { View } from "react-native";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUserProfileQuery } from "@/features/user/userQueries";
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

const ProfileCollectionLayout = () => {
	const t = useTranslations();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data, } = useUserProfileQuery({ username: username });
	return (
	<>
		<Stack.Screen
		options={{
			title: data ? `@${data.username}` : '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.collection', { count: 1 }))}</HeaderTitle>
		}}
		/>
		<MaterialTopTabs
		initialRouteName="movies"
		tabBar={(props) => <TabBar {...props} />}
		>
			<MaterialTopTabs.Screen name="movies" options={{ title: upperFirst(t('common.messages.film', { count: 2 })) }} initialParams={{ username }} />
			<MaterialTopTabs.Screen name="tv-series" options={{ title: upperFirst(t('common.messages.tv_series', { count: 2 })) }} initialParams={{ username }} />
		</MaterialTopTabs>
	</>
	)
};

export default ProfileCollectionLayout;