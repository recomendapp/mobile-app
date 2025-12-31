import React, { useCallback } from 'react';
import {
	LayoutChangeEvent,
	Pressable,
	View,
} from 'react-native';
import Animated, {
	Extrapolation,
	FadeIn,
	FadeInDown,
	interpolate,
	SharedValue,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { upperFirst } from 'lodash';
import { MediaPerson, MediaTvSeries } from '@recomendapp/types';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useLocale, useTranslations } from 'use-intl';
import { Text, TextProps } from '@/components/ui/text';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import BottomSheetUserActivityTvSeriesFollowersRating from '@/components/bottom-sheets/sheets/BottomSheetUserActivityTvSeriesFollowersRating';
import { useHeaderHeight } from '@react-navigation/elements';
import { TvSeriesHeaderInfo } from './TvSeriesHeaderInfo';
import { useImagePalette } from '@/hooks/useImagePalette';
import AnimatedImage from '@/components/ui/AnimatedImage';
import BottomSheetPerson from '@/components/bottom-sheets/sheets/BottomSheetPerson';
import { getTmdbImage } from '@/lib/tmdb/getTmdbImage';
import { useMediaTvSeriesFollowersAverageRatingQuery } from '@/api/medias/mediaQueries';

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
	const { palette } = useImagePalette(getTmdbImage({ path: tvSeries?.poster_path, size: 'w92' }) || undefined);
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
			{tvSeries && (
				tvSeries.backdrop_path ? (
					<AnimatedImage transition={500} style={tw`absolute inset-0`} source={{ uri: getTmdbImage({ path: tvSeries.backdrop_path, size: 'w1280' }) ?? '' }} />
				) : (palette && palette.length > 1 ) && (
					<Animated.View entering={FadeIn} style={[tw`absolute inset-0`, { backgroundColor: palette.at(0) }]} />
				)
			)}
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
			<Animated.View entering={FadeInDown.delay(200).duration(500)}>
				{!loading ? (
					<AnimatedImageWithFallback
					onLayout={(e) => {
						'worklet';
						posterHeight.value = e.nativeEvent.layout.height;
					}}
					transition={250}
					alt={tvSeries?.name ?? ''}
					source={{ uri: getTmdbImage({ path: tvSeries?.poster_path, size: 'w780' }) ?? '' }}
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
			</Animated.View>
			<Animated.View
			style={[
				tw.style('w-full items-center'),
				{ gap: GAP },
				textAnim
			]}
			>
				<View>
					{!loading ? (
						<Text
						variant="title"
						numberOfLines={2}
						style={[
							tw`text-center`,
							(!tvSeries && !loading) && { color: colors.mutedForeground }
						]}
						>
							{tvSeries?.name || upperFirst(t('common.messages.tv_series_not_found'))}
						</Text>
					) : <Skeleton style={tw.style('w-64 h-12')} />}
					{tvSeries?.created_by ? (
						<Directors style={tw`text-center`} directors={tvSeries.created_by} />
					) : null}
				</View>
				{tvSeries ? <TvSeriesHeaderInfo tvSeries={tvSeries} /> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
			</Animated.View>
		</Animated.View>
	</Animated.View>
	);
};

const Directors = ({ directors, ...props }: Omit<TextProps, 'children'> & { directors: MediaPerson[] }) => {
	const router = useRouter();
	const locale = useLocale();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const listFormatter = new Intl.ListFormat(locale, {
		style: 'long',
		type: 'conjunction',
	});
	const names = directors.map(d => d.name!);
	const formatted = listFormatter.formatToParts(names);

	const onPress = useCallback((person: MediaPerson) => {
		router.push({ pathname: '/person/[person_id]', params: { person_id: person.slug || person.id }})
	}, [router]);
	const onLongPress = useCallback((person: MediaPerson) => {
		openSheet(BottomSheetPerson, {
			person: person,
		});
	}, [openSheet]);
	return (
		<Text {...props}>
		{formatted.map((part, i) => {
			const director = directors.find(d => d.name === part.value);
			if (part.type === 'element') {
				return (
					<Text key={i} onPress={() => onPress(director!)} onLongPress={() => onLongPress(director!)}>
					{director?.name}
					</Text>
				);
			}
			return part.value;
		})}
		</Text>
	);
};
export default TvSeriesHeader;