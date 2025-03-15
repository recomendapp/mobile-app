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
import FilmHeader from '@/components/screens/film/FilmHeader';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';

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
			onHeaderHeight((event.nativeEvent.layout.height / 2) - 10);
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

	const tabBarHeight = useBottomTabOverflow();
	const inset = useSafeAreaInsets();
	const headerHeight = useSharedValue<number>(0);
	const filmHeaderHeight = useSharedValue<number>(0);
	const sv = useSharedValue<number>(0);
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
		'worklet';
		sv.value = event.contentOffset.y;
		},
	});

	const animatedScrollStyle = useAnimatedStyle(() => {
		return {
		marginTop: filmHeaderHeight.get(),
		paddingBottom: tabBarHeight + inset.bottom,
		};
	});
	const stickyElement = useAnimatedStyle(() => {
		return {
		transform: [
			{
			translateY: interpolate(
				sv.get(),
				[
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) - 1,
				filmHeaderHeight.get() - (headerHeight.get() + inset.top),
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[0, 0, 1],
			),
			},
		],
		};
	});

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
		<Animated.View style={tw.style('flex-1')}>
			<Animated.ScrollView
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			style={tw.style('flex-1')}
			showsVerticalScrollIndicator={false}
			>
				<FilmHeader
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
				<Animated.View
				style={[
					tw.style('gap-2'),
					animatedScrollStyle
				]}
				>
					{movie ? (
					<>
						{/* Fixed Section */}
						<ThemedAnimatedView
						style={[
							tw.style('items-center justify-center z-10 p-2'),
							stickyElement
						]}
						>
							<FilmNav slug={String(film_id)} />
						</ThemedAnimatedView>
						{/* SCREEN */}
						<ThemedView style={tw.style('gap-2 px-2 pb-2')}>
							<Slot />
						</ThemedView>
					</>
					) : null}
				</Animated.View>
			</Animated.ScrollView>
		</Animated.View>
    </ThemedAnimatedView>
	);
};

export default FilmLayout;