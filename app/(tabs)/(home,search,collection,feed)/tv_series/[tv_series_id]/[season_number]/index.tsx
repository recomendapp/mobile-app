import { ThemedText } from "@/components/ui/ThemedText";
import { useMediaTvSeriesSeasonDetailsQuery } from "@/features/media/mediaQueries";
import { useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { LayoutChangeEvent, Text, View } from "react-native";
import { MediaTvSeriesSeason } from "@/types/type.db";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import HeaderOverlay from "@/components/ui/HeaderOverlay";
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
	const { hslToRgb } = useColorConverter();
	const { colors, inset } = useTheme();
	const title = upperFirst(t('common.messages.tv_season_value', { number: season?.season_number! }));
	const bgColor = hslToRgb(colors.background);
	const posterHeight = useSharedValue(0);
	const randomBg = useRandomImage(season?.episodes?.filter(episode => episode.avatar_url).map(episode => episode.avatar_url!) ?? []);

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
			tw.style('flex-row items-center gap-4 py-2 px-4'),
			{ paddingTop: inset.top === 0 ? 8 : inset.top },
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
				source={{ uri: season?.avatar_url ?? '' }}
				style={[
					{ aspectRatio: 2 / 3 },
					tw.style('rounded-md w-24 h-auto'),
				]}
				type={'tv_season'}
				>
					<IconMediaRating
					rating={season?.tmdb_vote_average}
					variant="general"
					style={tw`absolute top-1 right-1`}
					/>
				</AnimatedImageWithFallback>
			) : <Skeleton style={[{ aspectRatio: 2 / 3 }, tw.style('w-24')]}/>}
			<Animated.View
			style={[
				tw.style('gap-2 w-full'),
			]}
			>
				{season ? <ThemedText>
					<ThemedText style={{ color: colors.accentYellow }}>
						{upperFirst(t(`common.messages.tv_season`, { count: 1 }))}
					</ThemedText>
					{` | ${season.serie?.title}`}
				</ThemedText> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
				{/* TITLE */}
				{!loading ? (
					<ThemedText
					numberOfLines={2}
					style={[
						tw.style('text-4xl font-bold'),
						(!season && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{title ?? upperFirst(t('common.messages.media_not_found'))}
					</ThemedText>
				) : <Skeleton style={tw.style('w-64 h-12')} />}
				{season?.title && (
					<ThemedText numberOfLines={1} style={[ { color: colors.mutedForeground }, tw.style('text-lg font-semibold')]}>
						{season.title}
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

const PADDING_BOTTOM = 8;

const TvSeriesSeasonScreen = () => {
	const { tv_series_id, season_number } = useLocalSearchParams<{ tv_series_id: string, season_number: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { colors, inset } = useTheme();
	const locale = useLocale();
	const t = useTranslations();
	const bottomTabBarHeight = useBottomTabOverflow();
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
		<HeaderOverlay
		triggerHeight={headerHeight}
		headerHeight={headerOverlayHeight}
		onHeaderHeight={(height) => {
			'worklet';
			headerOverlayHeight.value = height;
		}}
		scrollY={scrollY}
		title={`${season?.serie?.title ?? ''} (${upperFirst(t('common.messages.tv_season_short', { number: season?.season_number! }))})`}
		/>
		<AnimatedLegendList
		data={season?.episodes ?? []}
		renderItem={({ item }) => (
			<Animated.View
			key={item.id}
			style={[
				{ backgroundColor: colors.card, borderColor: colors.border },
				tw`flex-row justify-between items-center rounded-xl h-24 p-1 gap-2 border overflow-hidden mx-4`,
			]}
			>
				<View style={tw`flex-1 flex-row items-center gap-2`}>
					<ImageWithFallback
						source={{uri: item.avatar_url ?? ''}}
						alt={item.title ?? ''}
						type={'tv_episode'}
						style={tw`aspect-video w-auto`}
					>
						<IconMediaRating
						rating={item.tmdb_vote_average}
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
								{item.title ?? upperFirst(t('common.messages.tv_episode_value', { number: item.episode_number! }))}
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
		)}
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
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_tv_episodes'))}
					</Text>
				</View>
			) 
		}
		contentContainerStyle={[
			{
				paddingBottom: bottomTabBarHeight + inset.bottom + PADDING_BOTTOM,
			},
		]}
		keyExtractor={(item) => item.id!.toString()}
		columnWrapperStyle={tw`gap-2`}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default TvSeriesSeasonScreen;