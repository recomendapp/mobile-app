import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack, useLocalSearchParams, withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { Icons } from "@/constants/Icons";
import { useUserProfileQuery } from "@/api/users/userQueries";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Tab.Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Tab.Navigator);

const ProfileFollowLayout = () => {
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data: profile } = useUserProfileQuery({ username: username });
	const { colors } = useTheme();
	const t = useTranslations();
	return (
	<>
		<Stack.Screen
		options={{
			title: profile ? `@${profile.username}` : '',
			headerTitle: (props) => (
				<View style={tw`flex-row items-center gap-1`}>
						<HeaderTitle {...props}>
						{profile ? `@${profile.username}` : ''}
						</HeaderTitle>
						{profile?.premium && <Icons.premium color={colors.accentBlue} size={14} />}
				</View>
			),
			headerBackButtonDisplayMode: 'minimal',
		}}
		
		/>
		<MaterialTopTabs
		initialRouteName="followers"
		screenOptions={{
			tabBarIndicatorStyle: {
				backgroundColor: colors.accentBlue,
			},
			tabBarLabelStyle: {
				color: colors.foreground,
			},
			tabBarStyle: {
				backgroundColor: colors.background
			}
		}}
		>
			<MaterialTopTabs.Screen name="followers" initialParams={{ username }} options={{ title: upperFirst(t('common.messages.follower_count', { count: profile?.followers_count || 0 })) }} />
			<MaterialTopTabs.Screen name="followees" initialParams={{ username }} options={{ title: upperFirst(t('common.messages.followee_count', { count: profile?.following_count || 0 })) }} />
		</MaterialTopTabs>
	</>
	);
};

export default ProfileFollowLayout;
