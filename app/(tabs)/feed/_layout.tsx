import { useAuth } from "@/context/AuthProvider";
import { Redirect, Stack, withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import tw from "@/lib/tw";
import Animated from "react-native-reanimated";
import { Text, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/context/ThemeProvider";
import { TouchableOpacity } from "react-native-gesture-handler";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Tab.Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Tab.Navigator);

const TabBar = ({ state, descriptors, navigation, position } : MaterialTopTabBarProps) => {
	const { colors } = useTheme();
  return (
		<View style={[{ backgroundColor: colors.muted}, tw`flex-row items-center gap-2 p-2 rounded-md`]}>
      {state.routes.map((item, index) => {
        const { options } = descriptors[item.key];
        const label =
          options.tabBarLabel !== undefined
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
          <TouchableOpacity
          key={item.key}
          onPress={onPress}
          >
            <ThemedText
            style={[
              {
                color: isFocused ? colors.accentYellow : colors.mutedForeground,
              },
              tw`text-lg`
            ]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
		</View>
	)
};

const FeedLayout = () => {
  const { colors } = useTheme();
  const { session } = useAuth();

  if (session === null) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <ThemedSafeAreaView style={tw`flex-1`}>
      <MaterialTopTabs
      tabBar={(props) => <TabBar {...props} />}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: 'feed' }} />
        <MaterialTopTabs.Screen name="cast-crew" options={{ title: 'cast-crew' }} />
      </MaterialTopTabs>
    </ThemedSafeAreaView>
  );
};

export default FeedLayout;