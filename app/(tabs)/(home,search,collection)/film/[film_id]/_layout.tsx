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
import tailwind from 'twrnc';
import { Slot, useLocalSearchParams } from 'expo-router';
import { Icons } from '@/constants/Icons';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import FilmNav from '@/components/screens/film/FilmNav';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useBottomTabOverflow } from '@/components/TabBarBackground';
import { ThemedView } from '@/components/ui/ThemedView';
import FilmHeader from '@/components/screens/film/FilmHeader';

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
		className="absolute w-full px-4 pb-4 flex flex-row items-center justify-between gap-2 z-10 bg-background"
		style={[opacityAnim,]}
		onLayout={(event: LayoutChangeEvent) => {
			'worklet';
			onHeaderHeight((event.nativeEvent.layout.height / 2) - 10);
		}}
		>
			<Icons.ChevronLeft className="text-foreground opacity-0" />
			<ThemedText numberOfLines={1} className='text-xl font-medium shrink'>
			{title}
			</ThemedText>
			<Pressable onPress={() => console.log('pressed')}>
				<Icons.EllipsisVertical className="text-foreground"/>
			</Pressable>
		</Animated.View>
		{navigation.canGoBack() ? (
			<Pressable
			onPress={() => navigation.goBack()}
			className='absolute z-10'
			style={{
				top: inset.top,
				left: 14,
			}}
			>
				<Icons.ChevronLeft className="text-foreground" />
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
    <Animated.View className="flex-1 bg-background">
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
		<Animated.View className="flex-1">
			<Animated.ScrollView
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			className="flex-1"
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
				<Animated.View style={[animatedScrollStyle]}>
					{movie ? (
					<>
						{/* Fixed Section */}
						<Animated.View
						className="flex items-center justify-center z-10 p-2 bg-background"
						style={[stickyElement]}
						>
							<FilmNav slug={String(film_id)} />
						</Animated.View>
						{/* SCREEN */}
						<ThemedView className='gap-2 px-2 pb-2'>
							<Slot />
						</ThemedView>
					</>
					) : null}
				</Animated.View>
			</Animated.ScrollView>
		</Animated.View>
    </Animated.View>
	);
};

export default FilmLayout;