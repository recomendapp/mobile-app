import { ThemedText } from "@/components/ui/ThemedText";
import { useMediaTvSeriesSeasonDetailsQuery } from "@/features/media/mediaQueries";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { LayoutChangeEvent, Text, View } from "react-native";
import { MediaTvSeriesEpisode, MediaTvSeriesSeason } from "@recomendapp/types";
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
import { useLocale, useTranslations } from "use-intl";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useMemo } from "react";

interface MediaHeaderProps {
	season?: MediaTvSeriesSeason | null;
	loading: boolean;
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
}

const TvSeriesSeasonHeader: React.FC<MediaHeaderProps> = ({
	season,
	loading,
	scrollY,
	headerHeight,
	headerOverlayHeight,
}) => {
	const t = useTranslations();
	const navigationHeaderHeight = useHeaderHeight();
	const { hslToRgb } = useColorConverter();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const title = upperFirst(t('common.messages.tv_season_value', { number: season?.season_number! }));
	const bgColor = hslToRgb(colors.background);
	const posterHeight = useSharedValue(0);
	const randomBg = useRandomImage(season?.episodes?.filter(episode => episode.still_url).map(episode => episode.still_url!) ?? []);

	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + insets.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					scrollY.get(),
					[0, (headerHeight.get() - (headerOverlayHeight.get() + insets.top)) / 2],
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
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		headerHeight.value = event.nativeEvent.layout.height;
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
			{(season && randomBg) && <Image source={randomBg} style={tw`absolute inset-0`} />}
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
				source={{ uri: season?.poster_url ?? '' }}
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
				{season ? <ThemedText>
					<ThemedText style={{ color: colors.accentYellow }}>
						{upperFirst(t(`common.messages.tv_season`, { count: 1 }))}
					</ThemedText>
					{` | ${season.serie?.name}`}
				</ThemedText> : loading ? <Skeleton style={tw`w-32 h-8`} /> : null}
				{/* TITLE */}
				{!loading ? (
					<ThemedText
					numberOfLines={2}
					style={[
						tw`text-4xl font-bold`,
						(!season && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{title ?? upperFirst(t('common.messages.media_not_found'))}
					</ThemedText>
				) : <Skeleton style={tw`w-64 h-12`} />}
				{season?.name && (
					<ThemedText numberOfLines={1} style={[ { color: colors.mutedForeground }, tw`text-lg font-semibold`]}>
						{season.name}
					</ThemedText>
				)}
				{season?.episode_count ? (
					<ThemedText numberOfLines={1}>
						{upperFirst(t('common.messages.tv_episode_count', { count: season.episode_count }))}
					</ThemedText>
				) : undefined}
			</Animated.View>
		</Animated.View>
	</Animated.View>
	);
};

const TvSeriesSeasonScreen = () => {
	const { tv_series_id, season_number } = useLocalSearchParams<{ tv_series_id: string, season_number: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { colors, bottomTabHeight, tabBarHeight } = useTheme();
	const locale = useLocale();
	const t = useTranslations();
	const {
		data: season,
		isLoading,
		isRefetching,
		refetch,
	} = useMediaTvSeriesSeasonDetailsQuery({
		id: seriesId,
		seasonNumber: Number(season_number),
	});
	const loading = season === undefined || isLoading;
	// SharedValue
	const headerHeight = useSharedValue<number>(0);
	const headerOverlayHeight = useSharedValue<number>(0);
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
						source={{uri: item.still_url ?? ''}}
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
						<ThemedText numberOfLines={1}>
							<ThemedText style={{ color: colors.accentYellow }}>
								{upperFirst(t('common.messages.tv_episode_short', { seasonNumber: season?.season_number!, episodeNumber: item.episode_number! }))}
							</ThemedText>
							<ThemedText style={tw`font-bold`}>
								{" • "}
								{item.name ?? upperFirst(t('common.messages.tv_episode_value', { number: item.episode_number! }))}
							</ThemedText>
						</ThemedText>
						<ThemedText numberOfLines={2}>
							{item.overview ?? upperFirst(t('common.messages.no_overview'))}
						</ThemedText>
						<ThemedText numberOfLines={1} style={[tw`text-sm`, { color: colors.mutedForeground }]}>
							{item.air_date ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(item.air_date)) : upperFirst(t('common.messages.unknown'))}
						</ThemedText>
					</View>
				</View>
			</Animated.View>
		), [colors, locale, season, t])}
		onScroll={scrollHandler}
		ListHeaderComponent={
			<TvSeriesSeasonHeader
			season={season}
			loading={loading}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
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
			paddingBottom: bottomTabHeight + PADDING_VERTICAL,
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