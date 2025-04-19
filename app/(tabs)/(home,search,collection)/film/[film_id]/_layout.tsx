import React from 'react';
import {
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useLocalSearchParams, withLayoutContext } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import FilmHeader from '@/components/screens/film/FilmHeader';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import FilmProvider from '@/components/screens/film/FilmContext';
import HeaderOverlay from '@/components/ui/HeaderOverlay';
import { EdgeInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

interface TabBarProps extends MaterialTopTabBarProps {
	headerOverlayHeight: SharedValue<number>;
	headerHeight: SharedValue<number>;
	tabBarHeight: SharedValue<number>;
	scrollY: SharedValue<number>;
	onHeight: (height: number) => void;
	inset: EdgeInsets;
}

const TabBar = ({ state, descriptors, navigation, headerOverlayHeight, headerHeight, scrollY, tabBarHeight, inset, onHeight } : TabBarProps) => {
	const { colors } = useTheme();
	const anim = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: Math.max(
						headerOverlayHeight.get() + inset.top,
						headerHeight.get() - scrollY.get()
					  )
				},
			],
		};
	});
  	return (
		<Animated.View
		style={[
			{ backgroundColor: colors.muted },
			tw`absolute flex-row items-center p-1 z-10`,
			anim,
		]}
		onLayout={(event) => {
			'worklet';
			onHeight(event.nativeEvent.layout.height);
		}}
		>
			{state.routes.map((item, index) => {
				const { options } = descriptors[item.key];
				const label =
					options.title
					|| item.name;
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
					<View
					key={item.key}
					style={[
					{ backgroundColor: isFocused ? colors.background : undefined },
					tw`flex-1 py-2 px-1 rounded-md`,
					]}
					>
						<TouchableOpacity onPress={onPress}>
							<ThemedText
							style={[
							{
								color: isFocused ? colors.accentYellow : colors.mutedForeground,
							},
							tw`text-center`
							]}
							>
							{label}
							</ThemedText>
						</TouchableOpacity>
					</View>
				);
			})}
		</Animated.View>
	)
};

const FilmLayout = () => {
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { inset } = useTheme();
	const { id: movieId} = getIdFromSlug(film_id as string);
	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const loading = isLoading || movie === undefined;
	const [tabState, setTabState] = React.useState<TabNavigationState<ParamListBase>>();
	const headerOverlayHeight = useSharedValue<number>(43);
	const headerHeight = useSharedValue<number>(0);
	const tabBarHeight = useSharedValue<number>(33);
	const scrollY = useSharedValue<number>(0);

	// useAnimatedReaction(
	// 	() => headerScrollY.value,
	// 	(value) => {
	// 		'worklet';
	// 		runOnJS(handleHeaderScroll)(value);
	// 	}
	// )

	return (
	<FilmProvider
	tabState={tabState}
	movieId={movieId}
	headerHeight={headerHeight}
	headerOverlayHeight={headerOverlayHeight}
	tabBarHeight={tabBarHeight}
	scrollY={scrollY}
	>
    	<ThemedAnimatedView style={tw.style('flex-1')}>
			<HeaderOverlay
			triggerHeight={headerHeight}
			headerHeight={headerOverlayHeight}
			onHeaderHeight={(height) => {
				'worklet';
				headerOverlayHeight.value = height;
			}}
			scrollY={scrollY}
			title={movie?.title ?? ''}
			/>
			{movie ? (
				<MaterialTopTabs
				tabBar={(props) => (
					<TabBar
					inset={inset}
					headerOverlayHeight={headerOverlayHeight}
					headerHeight={headerHeight}
					scrollY={scrollY}
					tabBarHeight={tabBarHeight}
					onHeight={(height) => {
						'worklet';
						tabBarHeight.value = height;
					}}
					{...props}
					/>
				)}
				screenListeners={{
					state: (e) => {
						setTabState(e.data.state);
					}
				}}
				>
					<MaterialTopTabs.Screen name="index" options={{ title: 'Description' }} />
					<MaterialTopTabs.Screen name="reviews" options={{ title: 'Reviews' }} />
					<MaterialTopTabs.Screen name="playlists" options={{ title: 'Playlists' }} />
				</MaterialTopTabs>
			) : null}
			<FilmHeader
			movie={movie}
			loading={loading}
			/>
    	</ThemedAnimatedView>	
	</FilmProvider>
	);
};

export default FilmLayout;