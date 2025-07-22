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
import MediaActionUserActivityRating from '@/components/medias/actions/MediaActionUserActivityRating';
import { Image } from 'expo-image';
import MediaActionUserActivityLike from '@/components/medias/actions/MediaActionUserActivityLike';
import MediaActionUserActivityWatch from '@/components/medias/actions/MediaActionUserActivityWatch';
import MediaActionUserWatchlist from '@/components/medias/actions/MediaActionUserWatchlist';
import MediaActionPlaylistAdd from '@/components/medias/actions/MediaActionPlaylistAdd';
import MediaActionUserRecos from '@/components/medias/actions/MediaActionUserRecos';

interface MediaHeaderProps {
	media?: Media | null;
	loading: boolean;
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
}
const MediaHeader: React.FC<MediaHeaderProps> = ({
	media,
	loading,
	scrollY,
	headerHeight,
	headerOverlayHeight,
}) => {
	const { t } = useTranslation();
	const { hslToRgb } = useColorConverter();
	const { colors, inset } = useTheme();

	const bgColor = hslToRgb(colors.background);
	const posterHeight = useSharedValue(0);
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
			{media ? <Image
			style={tw`absolute inset-0`}
			source={{ uri: media.backdrop_url ?? '' }}
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
				alt={media?.title ?? ''}
				source={{ uri: media?.avatar_url ?? '' }}
				style={[
					{ aspectRatio: 2 / 3 },
					tw.style('rounded-md w-48 h-auto'),
					posterAnim
				]}
				type={media?.media_type}
				/>
			) : <Skeleton style={[{ aspectRatio: 2 / 3 }, tw.style('w-48'), posterAnim]}/>}
			<Animated.View
			style={[
				tw.style('gap-2 w-full'),
				textAnim
			]}
			>
				{/* GENRES */}
				{media ? <ThemedText>
					<ThemedText style={{ color: colors.accentYellow }}>{upperFirst('film')}</ThemedText>
					{media?.genres ? <Genres genres={media.genres} /> : null}
				</ThemedText> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
				{/* TITLE */}
				{!loading ? (
					<ThemedText
					numberOfLines={2}
					style={[
						tw.style('text-4xl font-bold'),
						(!media && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{media?.title ?? upperFirst(t('common.errors.film_not_found'))}
					</ThemedText>
				) : <Skeleton style={tw.style('w-64 h-12')} />}
				{(media?.extra_data.original_title && media.extra_data.original_title !== media.title) ? (
					<ThemedText numberOfLines={1} style={[ { color: colors.mutedForeground }, tw.style('text-lg font-semibold')]}>
						{media.extra_data.original_title}
					</ThemedText>
				) : null}
				{/* DIRECTORS & DURATION */}
				{media?.main_credit || media?.extra_data.runtime ? (
					<ThemedText>
						{media.main_credit ? <Directors directors={media.main_credit} /> : null}
					</ThemedText>
				) : null}

			</Animated.View>
		</Animated.View>
		{media ? (
		<View style={tw`flex-row items-center justify-between gap-4 p-2`}>
			<View style={tw`flex-row items-center gap-4`}>
				<MediaActionUserActivityRating media={media} />
				<MediaActionUserActivityLike media={media} />
				<MediaActionUserActivityWatch media={media} />
				<MediaActionUserWatchlist media={media} />
			</View>
			<View style={tw`flex-row items-center gap-4`}>
				<MediaActionPlaylistAdd media={media} />
				<MediaActionUserRecos media={media} />
			</View>
		</View>
		) : null}
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
export default MediaHeader;