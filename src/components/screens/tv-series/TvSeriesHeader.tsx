import React from 'react';
import {
	LayoutChangeEvent,
	Pressable,
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
import { MediaPerson, MediaTvSeries } from '@recomendapp/types';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { Image } from 'expo-image';
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import { useMediaTvSeriesFollowersAverageRatingQuery } from '@/features/media/mediaQueries';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useLocale, useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import BottomSheetUserActivityTvSeriesFollowersRating from '@/components/bottom-sheets/sheets/BottomSheetUserActivityTvSeriesFollowersRating';
import { ButtonPlaylistTvSeriesAdd } from '@/components/buttons/ButtonPlaylistTvSeriesAdd';
import ButtonUserActivityTvSeriesLike from '@/components/buttons/tv-series/ButtonUserActivityTvSeriesLike';
import { ButtonUserWatchlistTvSeries } from '@/components/buttons/tv-series/ButtonUserWatchlistTvSeries';
import ButtonUserActivityTvSeriesWatch from '@/components/buttons/tv-series/ButtonUserActivityTvSeriesWatch';
import ButtonUserActivityTvSeriesRating from '@/components/buttons/tv-series/ButtonUserActivityTvSeriesRating';
import ButtonUserRecoTvSeriesSend from '@/components/buttons/tv-series/ButtonUserRecoTvSeriesSend';
import { useHeaderHeight } from '@react-navigation/elements';
import { TvSeriesHeaderInfo } from './TvSeriesHeaderInfo';

interface TvSeriesHeaderProps {
	tvSeries?: MediaTvSeries | null;
	loading: boolean;
	scrollY: SharedValue<number>;
	triggerHeight: SharedValue<number>;
}
const TvSeriesHeader: React.FC<TvSeriesHeaderProps> = ({
	tvSeries,
	loading,
	scrollY,
	triggerHeight,
}) => {
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const t = useTranslations();
	const { hslToRgb } = useColorConverter();
	const { colors } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	const bgColor = hslToRgb(colors.background);
	const {
		data: followersAvgRating,
	} = useMediaTvSeriesFollowersAverageRatingQuery({
		tvSeriesId: tvSeries?.id,
	});
	// SharedValue
	const posterHeight = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	// Animated styles
	const posterAnim = useAnimatedStyle(() => {
		const stretch = Math.max(-scrollY.value, 0);
		const base = Math.max(posterHeight.value, 1);
		const scale = 1 + stretch / base;
		const clampedScale = Math.min(scale, 3);
		const translateY = -stretch / 2;
		return {
			transform: [
				{ translateY },
				{ scale: clampedScale },
			],
		};
	});
	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, (headerHeight.get() - navigationHeaderHeight) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					scrollY.get(),
					[0, (headerHeight.get() - navigationHeaderHeight) / 2],
					[1, 0.98],
					'clamp',
					),
				},
			],
		};
	});
	const bgAnim = useAnimatedStyle(() => {
		const stretch = Math.max(-scrollY.value, 0);
		const base = Math.max(headerHeight.value, 1);
		const scale = 1 + stretch / base;
		const clampedScale = Math.min(scale, 3);

		return {
			transform: [
				{ translateY: -stretch / 2 },
				{ scale: clampedScale },
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
		const height = event.nativeEvent.layout.height;
		headerHeight.value = height;
		triggerHeight.value = (height - navigationHeaderHeight) * 0.7;
	}}
	>
		<Animated.View
		style={[
			tw`absolute inset-0`,
			bgAnim,
		]}
		>
			{(tvSeries && tvSeries.backdrop_url) && <Image style={tw`absolute inset-0`} source={tvSeries.backdrop_url} />}
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
				alt={tvSeries?.name ?? ''}
				source={{ uri: tvSeries?.poster_url ?? '' }}
				style={[
					{ aspectRatio: 2 / 3 },
					tw.style('rounded-md w-48 h-auto'),
					posterAnim
				]}
				type={'tv_series'}
				>
					<View style={tw`absolute gap-2 top-2 right-2`}>
						{tvSeries?.vote_average ? (
							<IconMediaRating
							rating={tvSeries.vote_average}
							variant="general"
							/>
						) : null}
						{followersAvgRating && (
							<Pressable onPress={() => openSheet(BottomSheetUserActivityTvSeriesFollowersRating, { tvSeriesId: tvSeries?.id! })}>
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
				{tvSeries ? <TvSeriesHeaderInfo tvSeries={tvSeries} /> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
				{/* TITLE */}
				{!loading ? (
					<Text
					variant="title"
					numberOfLines={2}
					style={[
						(!tvSeries && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{tvSeries?.name || upperFirst(t('common.messages.tv_series_not_found'))}
					</Text>
				) : <Skeleton style={tw.style('w-64 h-12')} />}
				{(tvSeries?.original_name && lowerCase(tvSeries.original_name) !== lowerCase(tvSeries.name!)) ? (
					<Text numberOfLines={1} style={[ { color: colors.mutedForeground }, tw.style('text-lg font-semibold')]}>
						{tvSeries.original_name}
					</Text>
				) : null}
				{/* DIRECTORS & DURATION */}
				{tvSeries?.created_by ? (
					<Text>
						{tvSeries.created_by && <Directors directors={tvSeries.created_by} />}
					</Text>
				) : null}

			</Animated.View>
		</Animated.View>
		{tvSeries && (
		<View style={[tw`flex-row items-center justify-between gap-4`, { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL }]}>
			<View style={tw`flex-row items-center gap-4`}>
				<ButtonUserActivityTvSeriesRating tvSeries={tvSeries} />
				<ButtonUserActivityTvSeriesLike tvSeries={tvSeries} />
				<ButtonUserActivityTvSeriesWatch tvSeries={tvSeries} />
				<ButtonUserWatchlistTvSeries tvSeries={tvSeries} />
			</View>
			<View style={tw`flex-row items-center gap-4`}>
				<ButtonPlaylistTvSeriesAdd tvSeries={tvSeries} />
				<ButtonUserRecoTvSeriesSend tvSeries={tvSeries} />
			</View>
		</View>
		)}
	</Animated.View>
	);
};

const Directors = ({ directors }: { directors: MediaPerson[] }) => {
	const locale = useLocale();
	const listFormatter = new Intl.ListFormat(locale, {
		style: 'long',
		type: 'conjunction',
	});
	const names = directors.map(d => d.name!);
	const formatted = listFormatter.formatToParts(names);
	return (
		<>
		{formatted.map((part, i) => {
			const director = directors.find(d => d.name === part.value);
			if (part.type === 'element') {
				return (
					<Link key={i} href={`/person/${director?.slug || director?.id}`}>
					{director?.name}
					</Link>
				);
			}
			return part.value;
		})}
		</>
	);
};
export default TvSeriesHeader;