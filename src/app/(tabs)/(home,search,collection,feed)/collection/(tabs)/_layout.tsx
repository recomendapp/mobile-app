import { Button } from "@/components/ui/Button";
import { UserNav } from "@/components/user/UserNav";
import tw from "@/lib/tw";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute, ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack, useRouter, withLayoutContext } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { View, FlatList, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";
import UserAvatar from "@/components/user/UserAvatar";
import { useAuth } from "@/providers/AuthProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetPlaylistCreate from "@/components/bottom-sheets/sheets/BottomSheetPlaylistCreate";
import { Icons } from "@/constants/Icons";

const Tab = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Tab.Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Tab.Navigator);

const TabBar = ({ state, descriptors, navigation } : MaterialTopTabBarProps) => {
	const flatListRef = useRef<FlatList>(null);

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
	}, [navigation, state]);

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
	}, [descriptors, navigation, state]);

	useEffect(() => {
		onPressTab(state.routes[state.index], state.index, true);
	}, [onPressTab, state.index, state.routes]);

	return (
		<View>
			<Animated.FlatList
			ref={flatListRef}
			data={state.routes}
			renderItem={renderItem}
			keyExtractor={(item) => item.key}
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
	const router = useRouter();
	const { user } = useAuth();
 	const { colors } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const handleCreatePlaylist = useCallback(() => {
		openSheet(BottomSheetPlaylistCreate, {});
	}, [openSheet]);

	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: () => <></>,
			title: upperFirst(t('common.messages.library')),
			headerLeft: () => <HeaderTitle tintColor={colors.foreground}>{upperFirst(t('common.messages.library'))}</HeaderTitle>,
			headerRight: () => (
				<View style={tw`flex-row items-center gap-1`}>
					<Button
					variant="outline"
					icon={Icons.Add}
					size="icon"
					onPress={handleCreatePlaylist}
					style={tw`rounded-full`}
					/>
					<UserNav />
				</View>
			),
			unstable_headerRightItems: (props) => [
				{
					type: "button",
					label: 'create playlist',
					onPress: handleCreatePlaylist,
					icon: {
						name: "plus",
						type: "sfSymbol",
					},
				},
				{
					type: "custom",
					element: (
						<Pressable onPress={() => router.push(`/user/${user?.username}`)} disabled={!user}>
							{user ? <UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} style={{ width: 36, height: 36 }} /> : <UserAvatar skeleton style={{ width: 36, height: 36 }} />}
						</Pressable>
					)
				}
			]
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