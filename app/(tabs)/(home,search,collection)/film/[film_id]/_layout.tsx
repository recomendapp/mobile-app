import React from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useLocalSearchParams, withLayoutContext } from 'expo-router';
import { Icons } from '@/constants/Icons';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import { ParamListBase, TabNavigationState, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import FilmHeader from '@/components/screens/film/FilmHeader';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import FilmProvider, { useFilmContext } from '@/components/screens/film/FilmContext';
import HeaderOverlay from '@/components/ui/HeaderOverlay';

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
}

const TabBar = ({ state, descriptors, navigation, headerOverlayHeight, headerHeight, scrollY, tabBarHeight, onHeight } : TabBarProps) => {
	const { inset, colors } = useTheme();
	const anim = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(
					scrollY.get(),
					[
						headerHeight.get() + (headerOverlayHeight.get() + inset.top) - 1,
						headerHeight.get() + (headerOverlayHeight.get() + inset.top),
						headerHeight.get() + (headerOverlayHeight.get() + inset.top) + 1,
					],
					[0, 0, 1]
				),
			}
		]
	}));
  	return (
		<Animated.View
		style={[
			{ backgroundColor: colors.muted },
			tw`absolute flex-row items-center p-1 rounded-md z-10`,
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
					tw`flex-1 p-1 rounded-md`,
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
	const headerOverlayHeight = useSharedValue<number>(0);
	const headerHeight = useSharedValue<number>(0);
	const tabBarHeight = useSharedValue<number>(0);
	const scrollY = useSharedValue<number>(0);
	return (
	<FilmProvider
	tabState={tabState}
	headerHeight={headerHeight}
	headerOverlayHeight={headerOverlayHeight}
	tabBarHeight={tabBarHeight}
	scrollY={scrollY}
	movieId={movieId}
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
			{movie ? <MaterialTopTabs
			tabBar={(props) => (
				<TabBar
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
			/> : null}
			<FilmHeader
			movie={movie}
			loading={loading}
			/>
    	</ThemedAnimatedView>
	</FilmProvider>
	);
};

export default FilmLayout;