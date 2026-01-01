import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { LayoutChangeEvent, View } from "react-native";
import { Database, MediaTvSeriesEpisode } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { LinearGradient } from 'expo-linear-gradient';
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { Image } from 'expo-image';
import useColorConverter from "@/hooks/useColorConverter";
import { useRandomImage } from "@/hooks/useRandomImage";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { Icons } from "@/constants/Icons";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { IconMediaRating } from "@/components/medias/IconMediaRating";
import { useFormatter, useTranslations } from "use-intl";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback } from "react";
import { Text } from "@/components/ui/text";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useMediaTvSeriesSeasonDetailsQuery } from "@/api/medias/mediaQueries";

interface MediaHeaderProps {
	season?: Database['public']['Views']['media_tv_series_seasons']['Row']
		& {
			serie: Pick<Database['public']['Views']['media_tv_series']['Row'], 'id' | 'name'>;
			episodes: Database['public']['Views']['media_tv_series_episodes']['Row'][];
		} | null;
	loading: boolean;
	scrollY: SharedValue<number>;
	triggerHeight: SharedValue<number>;
}

const TvSeriesSeasonHeader: React.FC<MediaHeaderProps> = ({
	season,
	loading,
	scrollY,
	triggerHeight,
}) => {
	const t = useTranslations();
	const navigationHeaderHeight = useHeaderHeight();
	const { hslToRgb } = useColorConverter();
	const { colors } = useTheme();
	const title = upperFirst(t('common.messages.tv_season_value', { number: season?.season_number! }));
	const bgColor = hslToRgb(colors.background);
	const randomBg = useRandomImage(season?.episodes?.filter(episode => episode.still_path).map(episode => episode.still_path!) ?? []);
	// SharedValue
	const posterHeight = useSharedValue(0);
	const headerHeight = useSharedValue(0);

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
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		const height = event.nativeEvent.layout.height;
		headerHeight.value = height;
		triggerHeight.value = (height - navigationHeaderHeight) * 0.7
	}}
	style={{
		paddingHorizontal: PADDING_HORIZONTAL,
		paddingBottom: PADDING_VERTICAL,
		paddingTop: navigationHeaderHeight,
	}}
	>
		<Animated.View
		style={[
			tw`absolute inset-0`,
			bgAnim,
		]}
		>
			{(season && randomBg) && <Image source={{ uri: getTmdbImage({ path: randomBg, size: 'w1280' }) }} style={tw`absolute inset-0`} />}
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
			tw`flex-row items-center gap-4`,
			textAnim
		]}
		>
			{!loading ? (
				<AnimatedImageWithFallback
				onLayout={(e) => {
					'worklet';
					posterHeight.value = e.nativeEvent.layout.height;
				}}
				alt={title ?? ''}
				source={{ uri: getTmdbImage({ path: season?.poster_path, size: 'w342' }) ?? '' }}
				style={[
					{ aspectRatio: 2 / 3 },
					tw`rounded-md w-24 h-auto`,
				]}
				type={'tv_season'}
				>
					<IconMediaRating
					rating={season?.vote_average}
					variant="general"
					style={tw`absolute top-1 right-1`}
					/>
				</AnimatedImageWithFallback>
			) : <Skeleton style={[{ aspectRatio: 2 / 3 }, tw`w-24`]}/>}
			<Animated.View
			style={[
				{ gap: GAP },
				tw`w-full`,
			]}
			>
				{season ? <Text>
					<Text style={{ color: colors.accentYellow }}>
						{upperFirst(t(`common.messages.tv_season`, { count: 1 }))}
					</Text>
					{` | ${season.serie?.name}`}
				</Text> : loading ? <Skeleton style={tw`w-32 h-8`} /> : null}
				{/* TITLE */}
				{!loading ? (
					<Text
					numberOfLines={2}
					style={[
						tw`text-4xl font-bold`,
						(!season && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{title ?? upperFirst(t('common.messages.media_not_found'))}
					</Text>
				) : <Skeleton style={tw`w-64 h-12`} />}
				{season?.name && (
					<Text numberOfLines={1} style={[ { color: colors.mutedForeground }, tw`text-lg font-semibold`]}>
						{season.name}
					</Text>
				)}
				{season?.episode_count ? (
					<Text numberOfLines={1}>
						{upperFirst(t('common.messages.tv_episode_count', { count: season.episode_count }))}
					</Text>
				) : undefined}
			</Animated.View>
		</Animated.View>
	</Animated.View>
	);
};

const TvSeriesSeasonScreen = () => {
	const { tv_series_id, season_number } = useLocalSearchParams<{ tv_series_id: string, season_number: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const formatter = useFormatter();
	const t = useTranslations();
	const {
		data: season,
		isLoading,
		isRefetching,
		refetch,
	} = useMediaTvSeriesSeasonDetailsQuery({
		tvSeriesId: seriesId,
		seasonNumber: Number(season_number),
	});
	const loading = season === undefined || isLoading;
	// SharedValue
	const headerHeight = useSharedValue<number>(0);
	const scrollY = useSharedValue<number>(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: `${season?.serie?.name ?? ''} (${upperFirst(t('common.messages.tv_season_short', { number: season?.season_number! }))})`,
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		/>
		<AnimatedLegendList
		data={season?.episodes || []}
		renderItem={useCallback(({ item }: { item: MediaTvSeriesEpisode }) => (
			<Animated.View
			style={[
				{ backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: PADDING_HORIZONTAL },
				tw`flex-row justify-between items-center rounded-xl h-24 gap-2 border overflow-hidden`,
			]}
			>
				<View style={tw`flex-1 flex-row items-center gap-2`}>
					<ImageWithFallback
					source={{uri: getTmdbImage({ path: item.still_path, size: 'w500' })}}
					alt={item.name ?? ''}
					type={'tv_episode'}
					style={tw`aspect-video w-auto rounded-none`}
					>
						<IconMediaRating
						rating={item.vote_average}
						variant="general"
						style={tw`absolute top-1 right-1 w-10`}
						/>
					</ImageWithFallback>
					<View style={tw`shrink px-2 py-1 gap-1`}>
						<Text numberOfLines={1}>
							<Text style={{ color: colors.accentYellow }}>
								{upperFirst(t('common.messages.tv_episode_short', { seasonNumber: season?.season_number!, episodeNumber: item.episode_number! }))}
							</Text>
							<Text style={tw`font-bold`}>
								{" • "}
								{item.name ?? upperFirst(t('common.messages.tv_episode_value', { number: item.episode_number! }))}
							</Text>
						</Text>
						<Text numberOfLines={2}>
							{item.overview ?? upperFirst(t('common.messages.no_overview'))}
						</Text>
						<Text numberOfLines={1} style={[tw`text-sm`, { color: colors.mutedForeground }]}>
							{item.air_date ? formatter.dateTime(new Date(item.air_date), { year: 'numeric', month: 'long', day: 'numeric' }) : upperFirst(t('common.messages.unknown'))}
						</Text>
					</View>
				</View>
			</Animated.View>
		), [colors, season, t, formatter])}
		onScroll={scrollHandler}
		ListHeaderComponent={
			<TvSeriesSeasonHeader
			season={season}
			loading={loading}
			scrollY={scrollY}
			triggerHeight={headerHeight}
			/>
		}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View style={[tw`flex-1 items-center justify-center`, { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL }]}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_tv_episodes'))}
					</Text>
				</View>
			)
		}
		contentContainerStyle={{
			gap: GAP,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		keyExtractor={useCallback((item: MediaTvSeriesEpisode) => item.id!.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default TvSeriesSeasonScreen;