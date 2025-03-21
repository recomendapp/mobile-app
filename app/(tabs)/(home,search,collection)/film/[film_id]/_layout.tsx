import * as React from 'react';
import {
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import FilmProvider, { useFilmContext } from '@/components/screens/film/FilmContext';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

interface ScreenHeaderProps {
	title: string;
}
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	title,
}) => {
	const { colors } = useTheme();
	const navigation = useNavigation();
	const inset = useSafeAreaInsets();
	const { scrollY, headerHeight, headerOverlayHeight } = useFilmContext();
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			scrollY.get(),
			[
				((headerHeight.get() - (headerOverlayHeight.get() + inset.top)) / 4) * 3,
				headerHeight.get() - (headerOverlayHeight.get() + inset.top) + 1,
			],
			[0, 1],
			),
			transform: [
			{
				scale: interpolate(
				scrollY.get(),
				[
					((headerHeight.get() - (headerOverlayHeight.get() + inset.top)) / 4) * 3,
					headerHeight.get() - (headerOverlayHeight.get() + inset.top) + 1,
				],
				[0.98, 1],
				Extrapolation.CLAMP,
				),
			},
			{
				translateY: interpolate(
				scrollY.get(),
				[
					((headerHeight.get() - (headerOverlayHeight.get() + inset.top)) / 4) * 3,
					headerHeight.get() - (headerOverlayHeight.get() + inset.top) + 1,
				],
				[-10, 0],
				Extrapolation.CLAMP,
				),
			},
			],
			paddingTop: inset.top === 0 ? 8 : inset.top,
		};
	});
	return (
	<>
		<Animated.View
		style={[
			{ backgroundColor: colors.background },
			tw.style('absolute w-full px-4 pb-4 flex flex-row items-center justify-between gap-2 z-10'),
			opacityAnim
		]}
		onLayout={(event: LayoutChangeEvent) => {
			'worklet';
			headerOverlayHeight.value = (event.nativeEvent.layout.height / 2) - 10;
		}}
		>
			<Icons.ChevronLeft style={tw.style('opacity-0')} />
			<ThemedText numberOfLines={1} style={tw.style('text-xl font-medium shrink')}>
			{title}
			</ThemedText>
			<Pressable onPress={() => console.log('pressed')}>
				<Icons.EllipsisVertical color={colors.foreground} />
			</Pressable>
		</Animated.View>
		{navigation.canGoBack() ? (
			<Pressable
			onPress={() => navigation.goBack()}
			style={[
				tw.style('absolute z-10'),
				{
					top: inset.top,
					left: 14,
				}
			]}
			>
				<Icons.ChevronLeft color={colors.foreground} />
			</Pressable>
		) : null}
	</>
	);
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
	const scrollY = useSharedValue<number>(0);
	return (
	<FilmProvider
	tabState={tabState}
	headerHeight={headerHeight}
	headerOverlayHeight={headerOverlayHeight}
	scrollY={scrollY}
	movieId={movieId}
	>
    	<ThemedAnimatedView style={tw.style('flex-1')}>
			<ScreenHeader title={movie?.title ?? ''} />
			{movie ? <MaterialTopTabs
			tabBar={() => null}
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