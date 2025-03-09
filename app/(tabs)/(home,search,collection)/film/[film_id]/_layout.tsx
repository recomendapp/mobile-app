import * as React from 'react';
import {
	ActivityIndicator,
  Button,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
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
import { LinearGradient } from 'expo-linear-gradient';
import { Slot, useLocalSearchParams } from 'expo-router';
import { Icons } from '@/constants/Icons';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import { RefreshControl } from 'react-native-gesture-handler';
import FilmNav from '@/components/screens/film/FilmNav';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { upperFirst } from 'lodash';
import { MediaMovie } from '@/types/type.db';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import useColorConverter from '@/hooks/useColorConverter';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
// const headerHeight = 44 - 16;

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
    <Animated.View
	className="absolute w-full px-4 pb-4 flex flex-row items-center justify-between z-10 bg-background"
	style={[opacityAnim,]}
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		onHeaderHeight((event.nativeEvent.layout.height / 2) - 10);
	}}
	>
		{navigation.canGoBack() ? <Pressable onPress={() => navigation.goBack()}>
			<Icons.ChevronLeft className="text-foreground" />
		</Pressable> : null}
		<ThemedText className='text-xl font-medium'>
		{title}
		</ThemedText>
		<Pressable onPress={() => console.log('pressed')}>
			<Icons.EllipsisVertical className="text-foreground"/>
		</Pressable>
    </Animated.View>
  );
};

interface FilmHeaderProps {
	filmHeaderHeight: SharedValue<number>;
	onHeaderHeight: (height: number) => void;
	headerHeight: SharedValue<number>;
	sv: SharedValue<number>;
	movie: MediaMovie;
}
const FilmHeader: React.FC<FilmHeaderProps> = ({
	filmHeaderHeight,
	onHeaderHeight,
	headerHeight,
	sv,
	movie,
}) => {
	const { t } = useTranslation();
	const { hslToRgb } = useColorConverter();
	const colorsRef = useThemeColor({
		dark: Colors.dark.background,
		light: Colors.light.background,
	}, 'background');
	const colors = hslToRgb(colorsRef);
	const inset = useSafeAreaInsets();
	const layoutY = useSharedValue(0);
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			sv.get(),
			[0, filmHeaderHeight.get() - (headerHeight.get() + inset.top) / 0.9],
			[1, 0],
			Extrapolation.CLAMP,
			),
		};
	});
	const posterAnim = useAnimatedStyle(() => ({
		opacity: interpolate(
			sv.get(),
			[0, filmHeaderHeight.get() - (headerHeight.get() + inset.top) / 0.8],
			[1, 0],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				scale: interpolate(
					sv.get(),
					[-filmHeaderHeight.get() / 2, 0, (filmHeaderHeight.get() - (headerHeight.get() + inset.top))],
					[1.8, 1, 0.95],
					'clamp',
				),
			},
			{
				translateY: interpolate(
				sv.get(),
				[layoutY.value - 1, layoutY.value, layoutY.value + 1],
				[0.3, 0, -1],
				),
			},
		],
	}));
	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				sv.get(),
				[0, filmHeaderHeight.get() - (headerHeight.get() + inset.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					sv.get(),
					[0, (filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 2],
					[1, 0.95],
					'clamp',
					),
				},
				{
					translateY: interpolate(
						sv.get(),
						[layoutY.value - 1, layoutY.value, layoutY.value + 1],
						[1, 0, -1],
					),
				},
			],
		};
	});
	const scaleAnim = useAnimatedStyle(() => {
	return {
		transform: [
		{
			scale: interpolate(sv.get(), [-50, 0], [1.3, 1], {
			extrapolateLeft: 'extend',
			extrapolateRight: 'clamp',
			}),
		},
		],
	};
	});
	return (
    <Animated.View
	style={[
		{
			width: '100%',
			position: 'absolute'
		},
		opacityAnim
	]}
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		onHeaderHeight(event.nativeEvent.layout.height);
		layoutY.value = event.nativeEvent.layout.y;
	  }}
	>
		<AnimatedImageWithFallback
		alt={movie.title ?? ''}
		style={[tailwind.style('absolute h-full w-full'), scaleAnim]}
		source={{ uri: movie.backdrop_url ?? '' }}
		/>
		<AnimatedLinearGradient
		style={[tailwind.style('absolute inset-0'), scaleAnim]}
		colors={[
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.5)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.6)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.6)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.8)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 1)`,
		]}
		/>
		<Animated.View
		style={[
			tailwind.style('flex items-center gap-4 p-4'),
			{
				paddingTop: inset.top === 0 ? 8 : inset.top,
			},
		]}
		>
			<AnimatedImageWithFallback
			alt={movie.title ?? ''}
			source={{ uri: movie.avatar_url ?? '' }}
			style={[
				tailwind.style('w-32 h-48 rounded-md'),
				posterAnim,
			]}
			/>
			<Animated.View
			style={[
				tailwind.style('gap-2 w-full'),
				textAnim,
			]}
			>
				<View>
					<ThemedText className='text-accent-yellow'>{upperFirst('film')}</ThemedText>
					{movie.genres ? <Genres genres={movie.genres} /> : null}
				</View>
				<ThemedText
				numberOfLines={2}
				className='text-4xl font-bold'
				>
				{movie.title}
				</ThemedText>
			</Animated.View>
		</Animated.View>
    </Animated.View>
	);
};

const Genres = ({
	genres,
  } : {
	genres: {
	  id: number;
	  name: string;
	}[];
  }) => {
	const { i18n } = useTranslation();
	// const formattedGenres = new Intl.ListFormat(i18n.language, {
	//   style: 'narrow',
	//   type: 'conjunction',
	// }).formatToParts(genres.map((genre) => genre.name));
  
	return (
	  <>
		{/* {formattedGenres.map((part, index) => {
		  if (part.type === 'element') {
			const genre = genres.find((g) => g.name === part.value);
			return (
				<Link href={`/genre/${genre?.id}`}>{part.value}</Link>
			);
		  }
		  return part.value;
		})} */}
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
		isError,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const loading = isLoading || movie === undefined;
	const refresh = () => {
		refetch();
	};

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
		paddingTop: filmHeaderHeight.get(),
		};
	});
	const stickyElement = useAnimatedStyle(() => {
		return {
		transform: [
			{
			translateY: interpolate(
				sv.get(),
				[
				filmHeaderHeight.value - (headerHeight.get() + inset.top) - 1,
				filmHeaderHeight.value - (headerHeight.get() + inset.top),
				filmHeaderHeight.value - (headerHeight.get() + inset.top) + 1,
				],
				[0, 0, 1],
			),
			},
		],
		};
	});

	if (loading) {
		return (
			<ActivityIndicator />
		)
	}

	if (!movie) {
		return (
			<ThemedText>{t('common.errors.film_not_found')}</ThemedText>
		)
	}

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
		<FilmHeader
		filmHeaderHeight={filmHeaderHeight}
		onHeaderHeight={(height) => {
			'worklet';
			filmHeaderHeight.value = height;
		}}
		headerHeight={headerHeight}
		sv={sv}
		movie={movie}
		/>
		<Animated.View style={tailwind.style('flex-1')}>
			<Animated.ScrollView
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			className="flex-1"
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={isRefetching}
					onRefresh={refresh}
				/>
			}
			>
				<Animated.View style={[animatedScrollStyle]}>
					{/* Fixed Section */}
					<Animated.View
					className="flex items-center justify-center z-10 p-2 bg-background"
					style={[stickyElement,]}
					>
						<FilmNav slug={String(film_id)} />
					</Animated.View>
					{/* SCREEN */}
					<Slot />
				</Animated.View>
			</Animated.ScrollView>
		</Animated.View>
    </Animated.View>
	);
};

export default FilmLayout;