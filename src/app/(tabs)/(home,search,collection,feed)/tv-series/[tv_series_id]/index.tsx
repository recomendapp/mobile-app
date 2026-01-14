import { Href, Link, useLocalSearchParams } from "expo-router"
import { lowerCase, upperFirst } from "lodash";
import { Pressable, useWindowDimensions, View, ViewProps } from "react-native";
import { Database } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useCallback, useMemo, useState } from "react";
import TvSeriesWidgetSeasons from "@/components/screens/tv-series/TvSeriesWidgetSeasons";
import { useTranslations } from "use-intl";
import { Text, TextProps } from "@/components/ui/text";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { BORDER_RADIUS_FULL, GAP, GAP_XS, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import TvSeriesHeader from "@/components/screens/tv-series/TvSeriesHeader";
import TvSeriesWidgetPlaylists from "@/components/screens/tv-series/TvSeriesWidgetPlaylists";
import TvSeriesWidgetReviews from "@/components/screens/tv-series/TvSeriesWidgetReviews";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { FloatingBar } from "@/components/ui/FloatingBar";
import ButtonUserActivityTvSeriesRating from "@/components/buttons/tv-series/ButtonUserActivityTvSeriesRating";
import ButtonUserActivityTvSeriesLike from "@/components/buttons/tv-series/ButtonUserActivityTvSeriesLike";
import ButtonUserActivityTvSeriesWatch from "@/components/buttons/tv-series/ButtonUserActivityTvSeriesWatch";
import { ButtonUserWatchlistTvSeries } from "@/components/buttons/tv-series/ButtonUserWatchlistTvSeries";
import { ButtonPlaylistTvSeriesAdd } from "@/components/buttons/ButtonPlaylistTvSeriesAdd";
import ButtonUserRecoTvSeriesSend from "@/components/buttons/tv-series/ButtonUserRecoTvSeriesSend";
import AnimatedContentContainer from "@/components/ui/AnimatedContentContainer";
import { Icons } from "@/constants/Icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { LegendList } from "@legendapp/list";
import { Vimeo } from "react-native-vimeo-iframe";
import { useMediaTvSeriesCastQuery, useMediaTvSeriesDetailsQuery } from "@/api/medias/mediaQueries";
import TvSeriesWidgetCast from "@/components/screens/tv-series/TvSeriesWidgetCast";

const TvSeriesScreen = () => {
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { bottomOffset, tabBarHeight } = useTheme();
	const { session } = useAuth();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const {
		data: series,
		isLoading,
	} = useMediaTvSeriesDetailsQuery({
		tvSeriesId: seriesId,
	});
	// Prefetch 
	const { data: cast } = useMediaTvSeriesCastQuery({ tvSeriesId: seriesId });

	const loading = series === undefined || isLoading;
	
	// SharedValue
	const headerHeight = useSharedValue<number>(0);
	const scrollY = useSharedValue<number>(0);
	const floatingBarHeight = useSharedValue<number>(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});

	const animatedContentContainerStyle = useAnimatedStyle(() => {
		return {
			paddingBottom: withTiming(
				bottomOffset + (PADDING_VERTICAL * 2) + floatingBarHeight.value,
				{ duration: 300 }
			),
		};
	});

	const handleMenuPress = useCallback(() => {
		if (series) {
			openSheet(BottomSheetTvSeries, {
				tvSeries: series,
			});
		}
	}, [series, openSheet]);

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: series?.name || '',
			headerTransparent: true,
			unstable_headerRightItems: (props) => [
				{
					type: "button",
					label: upperFirst(t('common.messages.menu')),
					onPress: handleMenuPress,
					tintColor: props.tintColor,
					icon: {
						name: "ellipsis",
						type: "sfSymbol",
					},
				},
			],
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		onMenuPress={series ? handleMenuPress : undefined}
		/>
		<AnimatedContentContainer
		onScroll={scrollHandler}
		scrollToOverflowEnabled
		contentContainerStyle={animatedContentContainerStyle}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		>
			<TvSeriesHeader
			tvSeries={series}
			loading={loading}
			scrollY={scrollY}
			triggerHeight={headerHeight}
			/>
			{series && (
				<View style={tw`flex-col gap-4`}>
					{/* DETAILS */}
					<View style={{ gap: GAP  }}>
						<View style={{ gap: GAP_XS }}>
							<TvSeriesSynopsis tvSeries={series} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
							<TvSeriesOriginalTitle tvSeries={series} style={{ marginHorizontal: PADDING_HORIZONTAL }} />
						</View>
						<TvSeriesWidgetCast tvSeriesId={series.id} />
						<TvSeriesWidgetSeasons tvSeries={series} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
						<Link href={{ pathname: '/tv-series/[tv_series_id]/details', params: { tv_series_id: series.id }}} asChild>
							<Button variant="outline" style={{ marginHorizontal: PADDING_HORIZONTAL }}>
								{upperFirst(t('common.messages.see_more_details'))}
							</Button>
						</Link>
					</View>
					<TvSeriesTrailers tvSeries={series} />
					<TvSeriesWidgetPlaylists tvSeriesId={series.id} url={series.url as Href} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
					<TvSeriesWidgetReviews tvSeries={series} url={series.url as Href} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
				</View>
			)}
		</AnimatedContentContainer>
		{series && session && (
			<FloatingBar bottomOffset={bottomOffset + PADDING_VERTICAL} height={floatingBarHeight} containerStyle={{ paddingHorizontal: 0 }} style={tw`flex-row items-center justify-between`}>
				<View style={tw`flex-row items-center gap-2`}>
					<ButtonUserActivityTvSeriesRating tvSeries={series} />
					<ButtonUserActivityTvSeriesLike tvSeries={series} />
					<ButtonUserActivityTvSeriesWatch tvSeries={series} />
					<ButtonUserWatchlistTvSeries tvSeries={series} />
				</View>
				<View style={tw`flex-row items-center gap-2`}>
					<ButtonPlaylistTvSeriesAdd tvSeries={series} />
					<ButtonUserRecoTvSeriesSend tvSeries={series} />
				</View>
			</FloatingBar>
		)}
	</>
	)
};


const TvSeriesSynopsis = ({ tvSeries, style, containerStyle, numberOfLines = 5, ...props } : Omit<TextProps, 'children'> & { tvSeries: Database['public']['Views']['media_tv_series_full']['Row'], containerStyle: ViewProps['style'] }) => {
	const t = useTranslations();
	const { colors } = useTheme();
	const [showFullSynopsis, setShowFullSynopsis] = useState<boolean>(false);

	const toggleSynopsis = useCallback(() => {
		setShowFullSynopsis((prev) => !prev);
	}, []);

	if (!tvSeries.overview || tvSeries.overview.length === 0) return null;
	return (
		<Pressable
		style={[containerStyle]}
		onPress={toggleSynopsis}
		>
			<Text style={[tw`text-sm`, { color: colors.mutedForeground }, style]} numberOfLines={showFullSynopsis ? undefined : numberOfLines} ellipsizeMode="tail" {...props}>
				<Text style={tw`text-sm font-medium`}>
					{`${upperFirst(t('common.messages.overview'))} : `}
				</Text>
				{tvSeries.overview}
			</Text>
		</Pressable>
	)
};

const TvSeriesOriginalTitle = ({ tvSeries, style, numberOfLines = 1, ...props } : Omit<TextProps, 'children'> & { tvSeries: Database['public']['Views']['media_tv_series_full']['Row'] }) => {
	const t = useTranslations();
	const { colors } = useTheme();

	if (!tvSeries.original_name || lowerCase(tvSeries.original_name) === lowerCase(tvSeries.name!)) return null;
	return (
		<Text style={[tw`text-sm`, { color: colors.mutedForeground }, style]} numberOfLines={numberOfLines} {...props}>
			<Text style={tw`text-sm font-medium`}>
				{`${upperFirst(t('common.messages.original_title'))} : `}
			</Text>
			{tvSeries.original_name}
		</Text>
	)
};


// const TvSeriesCast = ({
// 	tvSeries,
// } : {
// 	tvSeries: Database['public']['Views']['media_tv_series_full']['Row']
// }) => {
// 	const t = useTranslations();
// 	const { width: screenWidth } = useWindowDimensions();
// 	const width = useMemo(() => clamp((screenWidth * 0.8) - ((PADDING_HORIZONTAL * 2) + GAP * 2), 400), [screenWidth]);
// 	const renderItem = useCallback((item: MediaTvSeriesCasting) => (
// 		<CardPerson variant='list' hideKnownForDepartment person={item.person!} style={tw`h-12`} />
// 	), []);

// 	const keyExtractor = useCallback((item: MediaTvSeriesCasting) => item.person_id!.toString(), []);
// 	if (!tvSeries.cast?.length) return null;

// 	return (
// 		<View> 
// 			<Text style={[tw`text-sm font-medium`, { marginHorizontal: PADDING_HORIZONTAL }]}>
// 				{`${upperFirst(t('common.messages.starring'))} :`}
// 			</Text>
// 			<MultiRowHorizontalList<MediaTvSeriesCasting>
// 			data={tvSeries.cast}
// 			renderItem={renderItem}
// 			keyExtractor={keyExtractor}
// 			contentContainerStyle={{
// 				paddingHorizontal: PADDING_HORIZONTAL,
// 				gap: GAP,
// 			}}
// 			columnStyle={{
// 				width: width,
// 				gap: GAP,
// 			}}
// 			snapToInterval={width + GAP}
// 			decelerationRate={"fast"}
// 			/>
// 		</View>
// 	)
// };

const TvSeriesTrailers = ({
	tvSeries,
} : {
	tvSeries: Database['public']['Views']['media_tv_series_full']['Row']
}) => {
	const { colors } = useTheme();
	const t = useTranslations();
	// UI
	const { width } = useWindowDimensions();
	const playerWidth = width - PADDING_HORIZONTAL * 2;
	const playerHeight = playerWidth * 9 / 16;
	// States
	const [selectedTrailer, setSelectedTrailer] = useState<Database['public']['Tables']['tmdb_tv_series_videos']['Row'] | null>(tvSeries.trailers?.at(0) || null);
	const normalizedSite = useMemo(() => selectedTrailer?.site.toLowerCase(), [selectedTrailer]);
	// Render
	const renderItem = useCallback(({ item }: { item: Database['public']['Tables']['tmdb_tv_series_videos']['Row'] }) => {
		const label = item.iso_639_1 === tvSeries.original_language ? 'VO' : (item.iso_639_1?.toUpperCase() || 'N/A');
		return (
			<Button variant={item.id === selectedTrailer?.id ? 'accent-yellow' : 'outline'} onPress={() => setSelectedTrailer(item)} style={{ borderRadius: BORDER_RADIUS_FULL }}>
				{label}
			</Button>
		)
	}, [selectedTrailer, tvSeries.original_language]);
	if (!tvSeries.trailers?.length || !selectedTrailer) return null;
	return (
		<View style={{ gap: GAP }}> 
			<View style={[tw`flex-row items-center`, { gap: GAP, marginHorizontal: PADDING_HORIZONTAL }]}>
				<Icons.PlayCircle color={colors.foreground} />
				<Text style={tw`text-lg font-medium`}>
					{upperFirst(t('common.messages.trailer', { count: 2 }))}
				</Text>
			</View>
			<View style={{ marginHorizontal: PADDING_HORIZONTAL }}>

				{
					normalizedSite === 'youtube' ? (
						<YoutubePlayer
						height={playerHeight}
						videoId={selectedTrailer.key}
						/>
					) : normalizedSite === 'vimeo' ? (
						<Vimeo
						videoId={selectedTrailer.key}
						params={'api=1&controls=1'}
						style={{ width: '100%', aspectRatio: 16 / 9 }}
						/>
					) : (
						<View style={[tw`items-center justify-center`, { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.muted }]}>
							<Text style={{ color: colors.mutedForeground }}>
								{upperFirst(t('common.messages.trailer', { count: 1 }))} not supported.
							</Text>
						</View>
					)
				}
			</View>
			<LegendList
			data={tvSeries.trailers || []}
			extraData={selectedTrailer}
			renderItem={renderItem}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingHorizontal: PADDING_HORIZONTAL, gap: GAP }}
			/>
		</View>
	)
};

export default TvSeriesScreen;