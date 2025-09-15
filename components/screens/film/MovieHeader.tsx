import React from 'react';
import {
	LayoutChangeEvent,
	View,
} from 'react-native';
import Animated, {
	Extrapolation,
	interpolate,
	SharedValue,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { lowerCase, upperFirst } from 'lodash';
import { MediaMovie, MediaPerson } from '@recomendapp/types';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { Image } from 'expo-image';
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import { useMediaMovieFollowersAverageRatingQuery } from '@/features/media/mediaQueries';
import { Pressable } from 'react-native-gesture-handler';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import BottomSheetUserActivityMovieFollowersRating from '@/components/bottom-sheets/sheets/BottomSheetUserActivityMovieFollowersRating';
import { ButtonPlaylistMovieAdd } from '@/components/buttons/ButtonPlaylistMovieAdd';
import ButtonUserActivityMovieLike from '@/components/buttons/movies/ButtonUserActivityMovieLike';
import { ButtonUserWatchlistMovie } from '@/components/buttons/movies/ButtonUserWatchlistMovie';
import ButtonUserActivityMovieWatch from '@/components/buttons/movies/ButtonUserActivityMovieWatch';
import ButtonUserActivityMovieRating from '@/components/buttons/movies/ButtonUserActivityMovieRating';
import ButtonUserRecoMovieSend from '@/components/buttons/movies/ButtonUserRecoMovieSend';
import { useHeaderHeight } from '@react-navigation/elements';

interface MovieHeaderProps {
	movie?: MediaMovie | null;
	loading: boolean;
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
}
const MovieHeader: React.FC<MovieHeaderProps> = ({
	movie,
	loading,
	scrollY,
	headerHeight,
	headerOverlayHeight,
}) => {
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const t = useTranslations();
	const { hslToRgb } = useColorConverter();
	const { colors } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	const bgColor = hslToRgb(colors.background);
	const {
		data: followersAvgRating,
	} = useMediaMovieFollowersAverageRatingQuery({
		movieId: movie?.id,
	});
	// SharedValue
	const posterHeight = useSharedValue(0);
	// Animated styles
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
				[0, headerHeight.get() - (headerOverlayHeight.get() + navigationHeaderHeight) / 0.8],
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
				[0, headerHeight.get() - (headerOverlayHeight.get() + navigationHeaderHeight) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					scrollY.get(),
					[0, (headerHeight.get() - (headerOverlayHeight.get() + navigationHeaderHeight)) / 2],
					[1, 0.95],
					'clamp',
					),
				},
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
	return (
	<Animated.View
	style={[
		tw.style('w-full'),
		{ paddingTop: navigationHeaderHeight }
	]}
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		headerHeight.value = event.nativeEvent.layout.height;
	}}
	>
		<Animated.View
		style={[
			tw`absolute inset-0`,
			bgAnim,
		]}
		>
			{(movie && movie.backdrop_url) && <Image style={tw`absolute inset-0`} source={movie.backdrop_url} />}
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
			tw.style('items-center gap-4'),
			{ paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL }
		]}
		>
			{!loading ? (
				<AnimatedImageWithFallback
				onLayout={(e) => {
					'worklet';
					posterHeight.value = e.nativeEvent.layout.height;
				}}
				alt={movie?.title ?? ''}
				source={{ uri: movie?.poster_url ?? '' }}
				style={[
					{ aspectRatio: 2 / 3 },
					tw.style('rounded-md w-48 h-auto'),
					posterAnim
				]}
				type={'movie'}
				>
					<View style={tw`absolute gap-2 top-2 right-2`}>
						{movie?.vote_average ? (
							<IconMediaRating
							rating={movie.vote_average}
							variant="general"
							/>
						) : null}
						{followersAvgRating && (
							<Pressable onPress={() => openSheet(BottomSheetUserActivityMovieFollowersRating, { movieId: movie?.id! })}>
								<IconMediaRating
								rating={followersAvgRating.follower_avg_rating}
								variant="follower"
								/>
							</Pressable>
						)}
					</View>
				</AnimatedImageWithFallback>
			) : <Skeleton style={[{ aspectRatio: 2 / 3 }, tw.style('w-48'), posterAnim]}/>}
			<Animated.View
			style={[
				tw.style('gap-2 w-full'),
				textAnim
			]}
			>
				{/* GENRES */}
				{movie ? <Text>
					<Text style={{ color: colors.accentYellow }}>
						{upperFirst(t('common.messages.film', { count: 1 }))}
					</Text>
					{movie?.genres ? <Genres genres={movie.genres} /> : null}
				</Text> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
				{/* TITLE */}
				{!loading ? (
					<Text
					variant="title"
					numberOfLines={2}
					style={[
						(!movie && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{movie?.title || upperFirst(t('common.messages.film_not_found'))}
					</Text>
				) : <Skeleton style={tw.style('w-64 h-12')} />}
				{(movie?.original_title && lowerCase(movie.original_title) !== lowerCase(movie.title!)) ? (
					<Text numberOfLines={1} style={[ { color: colors.mutedForeground }, tw.style('text-lg font-semibold')]}>
						{movie.original_title}
					</Text>
				) : null}
				{/* DIRECTORS & DURATION */}
				{movie?.directors || movie?.runtime ? (
					<Text>
						{movie.directors && <Directors directors={movie.directors} />}
					</Text>
				) : null}

			</Animated.View>
		</Animated.View>
		{movie && (
		<View style={[tw`flex-row items-center justify-between gap-4`, { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL }]}>
			<View style={tw`flex-row items-center gap-4`}>
				<ButtonUserActivityMovieRating movie={movie} />
				<ButtonUserActivityMovieLike movie={movie} />
				<ButtonUserActivityMovieWatch movie={movie} />
				<ButtonUserWatchlistMovie movie={movie} />
			</View>
			<View style={tw`flex-row items-center gap-4`}>
				<ButtonPlaylistMovieAdd movie={movie} />
				<ButtonUserRecoMovieSend movie={movie} />
			</View>
		</View>
		)}
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
	return (
	  	<>
			{" | "}
			{genres.map((genre, index) => (
				<React.Fragment key={index}>
					{index !== 0 ? ", " : null}
					<Link href={`/genre/${genre.id}`}>{genre.name}</Link>
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
					<Link href={`/person/${director.id}`}>{director.name}</Link>
				</React.Fragment>
			))}
		</>
	)
};
export default MovieHeader;