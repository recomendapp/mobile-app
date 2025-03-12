import * as React from 'react';
import {
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Slot, useLocalSearchParams } from 'expo-router';
import { Icons } from '@/constants/Icons';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import FilmNav from '@/components/screens/film/FilmNav';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import FilmHeaderTwo from '@/components/screens/film/FilmHeaderTwo';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';
import { FlashList } from '@shopify/flash-list';
import { useFilmStore } from '@/stores/filmStore';
interface ScreenHeaderProps {
	filmHeaderHeight: SharedValue<number>;
	headerHeight: SharedValue<number>;
	onHeaderHeight: (height: number) => void;
	sv: SharedValue<number>;
	title: string;
}
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	filmHeaderHeight,
	headerHeight,
	onHeaderHeight,
	sv,
	title,
}) => {
	const { colors } = useTheme();
	const navigation = useNavigation();
	const inset = useSafeAreaInsets();
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			sv.get(),
			[
				((filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
			],
			[0, 1],
			),
			transform: [
			{
				scale: interpolate(
				sv.get(),
				[
					((filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
					filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[0.98, 1],
				Extrapolation.CLAMP,
				),
			},
			{
				translateY: interpolate(
				sv.get(),
				[
					((filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
					filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
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
			onHeaderHeight((event.nativeEvent.layout.height / 2) - 8);
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

const FilmScreen = () => {
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { sv, headerHeight, filmHeaderHeight } = useFilmStore();
	const { id: movieId } = getIdFromSlug(film_id as string);
	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const loading = isLoading || movie === undefined;

	const inset = useSafeAreaInsets();
	const layoutY = useSharedValue<number>(0);
	const stickyElement = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(
					sv.get(),
					[layoutY.value - 1, layoutY.value, layoutY.value + 1],
					[1, 0, -1],
				),
			}
		]
	}));

	return (
		<ThemedAnimatedView style={tw.style('flex-1')}>
			<ScreenHeader
			filmHeaderHeight={filmHeaderHeight}
			headerHeight={headerHeight}
			onHeaderHeight={(height) => {
				'worklet';
				headerHeight.value = height;
			}}
			sv={sv}
			title={movie?.title ?? ''}
			/>
			<FilmHeaderTwo
			filmHeaderHeight={filmHeaderHeight}
			onHeaderHeight={(height) => {
				'worklet';
				filmHeaderHeight.value = height;
			}}
			headerHeight={headerHeight}
			sv={sv}
			movie={movie}
			loading={loading}
			/>
			{movie ? (
				<>
					{/* <ThemedAnimatedView
					style={[
						tw.style('absolute w-full items-center justify-center z-10 p-2'),
						{ top: filmHeaderHeight.get(), },
						stickyElement
					]}
					onLayout={(event: LayoutChangeEvent) => {
						'worklet';
						setStickyHeight(event.nativeEvent.layout.height);
					}}
					>
						<FilmNav slug={String(film_id)} />
					</ThemedAnimatedView> */}
					<Slot />
				</>
			) : null}
		</ThemedAnimatedView>
	);
};

export default FilmScreen;