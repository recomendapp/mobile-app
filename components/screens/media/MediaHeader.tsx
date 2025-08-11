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
import { Media, MediaPerson } from '@/types/type.db';
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
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import { useMediaFollowersAverageRatingQuery } from '@/features/media/mediaQueries';
import { Pressable } from 'react-native-gesture-handler';
import BottomSheetMediaFollowersAverageRating from '@/components/bottom-sheets/sheets/BottomSheetMediaFollowersAverageRating';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';

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
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const t = useTranslations();
	const { hslToRgb } = useColorConverter();
	const { colors, inset } = useTheme();
	const bgColor = hslToRgb(colors.background);
	const {
		data: followersAvgRating,
	} = useMediaFollowersAverageRatingQuery({
		id: media?.media_id,
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
			{(media && media.backdrop_url) && <Image style={tw`absolute inset-0`} source={media.backdrop_url} />}
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
			tw.style('items-center gap-4 py-2 px-4'),
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
				>
					<View style={tw`absolute gap-2 top-2 right-2`}>
						{(media?.vote_average || media?.tmdb_vote_average) ? (
							<IconMediaRating
							rating={media?.vote_average ?? media?.tmdb_vote_average}
							variant="general"
							/>
						) : null}
						{followersAvgRating && (
							<Pressable onPress={() => openSheet(BottomSheetMediaFollowersAverageRating, { mediaId: media?.media_id! })}>
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
				{media ? <Text>
					<Text style={{ color: colors.accentYellow }}>
						{
							media.media_type === 'tv_series' ? upperFirst(t('common.messages.tv_series', { count: 1 }))
							: media.media_type === 'tv_season' ? upperFirst(t('common.messages.tv_season', { count: 1 }))
							: media.media_type === 'tv_episode' ? upperFirst(t('common.messages.tv_episode', { count: 1 }))
							: media.media_type === 'movie' ? upperFirst(t('common.messages.film', { count: 1 }))
							: media.media_type === 'person' ? upperFirst(t('common.messages.person', { count: 1 }))
							: upperFirst(t('common.messages.media', { count: 1 }))
						}
					</Text>
					{media?.genres ? <Genres genres={media.genres} /> : null}
				</Text> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
				{/* TITLE */}
				{!loading ? (
					<Text
					variant="title"
					numberOfLines={2}
					style={[
						(!media && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{media?.title ?? (
							media?.media_type === 'tv_series' ? upperFirst(t('common.messages.tv_series_not_found')) :
							media?.media_type === 'person' ? upperFirst(t('common.messages.person_not_found')) :
							media?.media_type === 'movie' ? upperFirst(t('common.messages.film_not_found')) :
							media?.media_type === 'tv_episode' ? upperFirst(t('common.messages.tv_episode_not_found')) :
							media?.media_type === 'tv_season' ? upperFirst(t('common.messages.tv_season_not_found')) :
							upperFirst(t('common.messages.media_not_found'))
						)}
					</Text>
				) : <Skeleton style={tw.style('w-64 h-12')} />}
				{(media?.extra_data.original_title && lowerCase(media.extra_data.original_title) !== lowerCase(media.title!)) ? (
					<Text numberOfLines={1} style={[ { color: colors.mutedForeground }, tw.style('text-lg font-semibold')]}>
						{media.extra_data.original_title}
					</Text>
				) : null}
				{/* DIRECTORS & DURATION */}
				{media?.main_credit || media?.extra_data.runtime ? (
					<Text>
						{media.main_credit ? <Directors directors={media.main_credit} /> : null}
					</Text>
				) : null}

			</Animated.View>
		</Animated.View>
		{media ? (
		<View style={tw`flex-row items-center justify-between gap-4 py-2 px-4`}>
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
					<Link href={`/person/${director.id}`}>{director.title}</Link>
				</React.Fragment>
			))}
		</>
	)
};
export default MediaHeader;