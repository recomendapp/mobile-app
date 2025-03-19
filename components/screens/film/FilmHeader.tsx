import * as React from 'react';
import {
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ui/ThemedText';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { upperFirst } from 'lodash';
import { MediaMovie, MediaPerson } from '@/types/type.db';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { useFilmContext } from './FilmContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface FilmHeaderProps {
	movie?: MediaMovie | null;
	loading: boolean;
}
const FilmHeader: React.FC<FilmHeaderProps> = ({
	movie,
	loading,
}) => {
	const { t } = useTranslation();
	const { hslToRgb } = useColorConverter();
	const { colors } = useTheme();
	const { scrollY, headerOverlayHeight, headerHeight, headerScrollY, scrollRefs, tabState } = useFilmContext();
	const bgColor = hslToRgb(colors.background);
	const inset = useSafeAreaInsets();
	const layoutY = useSharedValue(0);
	const headerScrollStart = useSharedValue(0);
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.9],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					translateY: interpolate(
						scrollY.get(),
						[layoutY.get() - 1, layoutY.get(), layoutY.get() + 1],
						[1, 0, -1],
					),
				},
			],
		};
	});
	const posterAnim = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollY.get(),
			[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.8],
			[1, 0],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				scale: interpolate(
					scrollY.get(),
					[-headerHeight.get() / 2, 0, (headerHeight.get() - (headerOverlayHeight.get() + inset.top))],
					[1.8, 1, 0.95],
					'clamp',
				),
			},
			{
				translateY: interpolate(
				scrollY.get(),
				[layoutY.get() - 1, layoutY.get(), layoutY.get()],
				[-0.3, 0, -1],
				),
			},
		],
	}));
	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					scrollY.get(),
					[0, (headerHeight.get() - (headerOverlayHeight.get() + inset.top)) / 2],
					[1, 0.95],
					'clamp',
					),
				},
				// {
				// 	translateY: interpolate(
				// 		scrollY.get(),
				// 		[layoutY.get() - 1, layoutY.get(), layoutY.get() + 1],
				// 		[1, 0, -1],
				// 	),
				// },
			],
		};
	});
	const scaleAnim = useAnimatedStyle(() => {
		return {
			// transform: [
			// {
			// 	scale: interpolate(scrollY.get(), [-50, 0], [1.3, 1], {
			// 	extrapolateLeft: 'extend',
			// 	extrapolateRight: 'clamp',
			// 	}),
			// },
			// ],
		};
	});

	const handleHeaderGestureEnd = (gestureState: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
		if (scrollY.get() < 0) {
			scrollRefs.forEach((listRef) => {
				listRef.current?.scrollToOffset({
				  offset: 0,
				  animated: true,
				});
			  });
		} else {
			if (Math.abs(gestureState.velocityY) < 200) return;
			headerScrollY.value = withDecay({
				velocity: -gestureState.velocityY,
				deceleration: 0.998,
			})
		}
	};

	const headerGesture = Gesture.Pan()
		.onBegin(() => {
			headerScrollStart.value = scrollY.get(); // Sauvegarde la position initiale du scroll
	  	})
		.onUpdate((event) => {
			const newScrollValue = headerScrollStart.get() - event.translationY;
			headerScrollY.value = newScrollValue;
		})
		.onEnd((e) => {
			runOnJS(handleHeaderGestureEnd)(e);
		});

	return (
	<GestureDetector gesture={headerGesture}>
		<Animated.View
		style={[
			tw.style('w-full absolute'),
			opacityAnim
		]}
		onLayout={(event: LayoutChangeEvent) => {
			'worklet';
			headerHeight.value = event.nativeEvent.layout.height;
			layoutY.value = event.nativeEvent.layout.y;
		}}
		>
			{movie ? <Animated.Image
			style={[tw.style('absolute h-full w-full'), scaleAnim]}
			source={{ uri: movie.backdrop_url ?? '' }}
			/> : null}
			<AnimatedLinearGradient
			style={[tw.style('absolute inset-0'), scaleAnim]}
			colors={[
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.3)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.4)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.5)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.8)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`,
			]}
			/>
			<Animated.View
			style={[
				tw.style('items-center gap-4 p-2'),
				{ paddingTop: inset.top === 0 ? 8 : inset.top }
			]}
			>
				{!loading ? (
					<AnimatedImageWithFallback
					alt={movie?.title ?? ''}
					source={{ uri: movie?.avatar_url ?? '' }}
					style={[
						{ aspectRatio: 2 / 3, height: 'fit-content' },
						tw.style('rounded-md w-48'),
						posterAnim
					]}
					/>
				) : <Skeleton style={[{ aspectRatio: 2 / 3 }, tw.style('w-48'), posterAnim]}/>}
				<Animated.View
				style={[
					tw.style('gap-2 w-full'),
					textAnim
				]}
				>
					{/* GENRES */}
					{movie ? <ThemedText>
						<ThemedText style={{ color: colors.accentYellow }}>{upperFirst('film')}</ThemedText>
						{movie?.genres ? <Genres genres={movie.genres} /> : null}
					</ThemedText> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
					{/* TITLE */}
					{!loading ? (
						<ThemedText
						numberOfLines={2}
						style={[
							tw.style('text-4xl font-bold'),
							(!movie && !loading) && { textAlign: 'center', color: colors.mutedForeground }
						]}
						>
							{movie?.title ?? upperFirst(t('common.errors.film_not_found'))}
						</ThemedText>
					) : <Skeleton style={tw.style('w-64 h-12')} />}
					{(movie?.extra_data.original_title && movie.extra_data.original_title !== movie.title) ? (
						<ThemedText numberOfLines={1} style={[ { color: colors.mutedForeground }, tw.style('text-lg font-semibold')]}>
							{movie.extra_data.original_title}
						</ThemedText>
					) : null}
					{/* DIRECTORS & DURATION */}
					{movie?.main_credit || movie?.extra_data.runtime ? (
						<ThemedText>
							{movie.main_credit ? <Directors directors={movie.main_credit} /> : null}
						</ThemedText>
					) : null}

				</Animated.View>
			</Animated.View>
		</Animated.View>
	</GestureDetector>
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
	// const formattedGenres = new Intl.ListFormat(i18n.language, {
	//   style: 'narrow',
	//   type: 'conjunction',
	// }).formatToParts(genres.map((genre) => genre.name));
	return (
	  	<>
			{" | "}
			{genres.map((genre, index) => (
				<React.Fragment key={index}>
					{index !== 0 ? ", " : null}
					<Link href={`/genre/${genre.id}`} onPress={() => console.log('link pressed')}>{genre.name}</Link>
				</React.Fragment>
			))}
		</>
	);
};

const Directors = ({
	directors,
} : {
	directors: MediaPerson[];
}) => {
	return (
		<>
			{directors.map((director, index) => (
				<React.Fragment key={index}>
					{index !== 0 ? ", " : null}
					<Link href={`/person/${director.id}`}>{director.title}</Link>
				</React.Fragment>
			))}
		</>
	)
};
export default FilmHeader;