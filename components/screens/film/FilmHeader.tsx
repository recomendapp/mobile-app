import React from 'react';
import {
  LayoutChangeEvent,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ui/ThemedText';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { upperFirst } from 'lodash';
import { Media, MediaMovie, MediaPerson } from '@/types/type.db';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFilmContext } from './FilmContext';
import MediaActionUserActivityRating from '@/components/medias/actions/MediaActionUserActivityRating';
import { Image } from 'expo-image';
import MediaActionUserActivityLike from '@/components/medias/actions/MediaActionUserActivityLike';
import MediaActionUserActivityWatch from '@/components/medias/actions/MediaActionUserActivityWatch';
import MediaActionUserWatchlist from '@/components/medias/actions/MediaActionUserWatchlist';
import MediaActionPlaylistAdd from '@/components/medias/actions/MediaActionPlaylistAdd';
import MediaActionUserRecos from '@/components/medias/actions/MediaActionUserRecos';

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
	const { colors, inset } = useTheme();
	const {
		scrollY,
		headerOverlayHeight,
		headerHeight,
		headerScrollY,
		scrollRefs,
		tabState,
	} = useFilmContext();
	const bgColor = hslToRgb(colors.background);
	const layoutY = useSharedValue(0);
	const headerScrollStart = useSharedValue(0);
	const posterHeight = useSharedValue(0);
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
	const posterAnim = useAnimatedStyle(() => {
		const scaleValue = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[3, 1],
			Extrapolation.CLAMP,
		);
		const scaleOffset = (posterHeight.get() * (scaleValue - 1)) / 2;
		const freezeScroll = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[-headerHeight.get(), 1],
			Extrapolation.CLAMP,
		);
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{ scale: scaleValue },
				{ translateY: freezeScroll + scaleOffset },
			],
		};
	});
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
	const bgAnim = useAnimatedStyle(() => {
		const scaleValue = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[2, 1],
			Extrapolation.CLAMP,
		);
		const offset = (headerHeight.get() * (scaleValue - 1)) / 2;
		return {
			transform: [
				{ scale: scaleValue },
				{ translateY: -offset },
			],
		};
	});
	const handleHeaderGestureEnd = () => {
		scrollRefs.forEach((listRef) => {
			listRef.current?.scrollToOffset({
				offset: 0,
				animated: true,
			});
		});
	};

	const headerGesture = Gesture.Pan()
		.onBegin(() => {
			headerScrollStart.value = scrollY.get();
		})
		.onChange((event) => {
			headerScrollY.value = headerScrollStart.get() - event.translationY;
		})
		.onFinalize((e) => {
			console.log('headerScrollY', e.velocityY);
			if (headerScrollY.get() < 0) {
				runOnJS(handleHeaderGestureEnd)()
			} else {
				if (Math.abs(e.velocityY) < 200) return;
				headerScrollY.value = withDecay({
					velocity: e.velocityY,
				})
			}
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
			<Animated.View
			style={[
				tw`absolute inset-0`,
				bgAnim,
			]}
			>
				{movie ? <Image
				style={tw`absolute inset-0`}
				source={{ uri: movie.backdrop_url ?? '' }}
				/> : null}
				<LinearGradient
				style={tw`absolute inset-0`}
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
			</Animated.View>
			<Animated.View
			style={[
				tw.style('items-center gap-4 p-2'),
				{ paddingTop: inset.top === 0 ? 8 : inset.top }
			]}
			>
				{!loading ? (
					<AnimatedImageWithFallback
					onLayout={(e) => {
						'worklet';
						posterHeight.value = e.nativeEvent.layout.height;
					}}
					alt={movie?.title ?? ''}
					source={{ uri: movie?.avatar_url ?? '' }}
					style={[
						{ aspectRatio: 2 / 3, height: 'fit-content' },
						tw.style('rounded-md w-48'),
						posterAnim
					]}
					type="movie"
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
			{movie ? (
			<View style={tw`flex-row items-center justify-between gap-4 p-2`}>
				<View style={tw`flex-row items-center gap-4`}>
					<MediaActionUserActivityRating media={movie as Media} />
					<MediaActionUserActivityLike media={movie as Media} />
					<MediaActionUserActivityWatch media={movie as Media} />
					<MediaActionUserWatchlist media={movie as Media} />
				</View>
				<View style={tw`flex-row items-center gap-4`}>
					<MediaActionPlaylistAdd media={movie as Media} />
					<MediaActionUserRecos media={movie as Media} />
				</View>
			</View>
			) : null}
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