import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { Href, Link, useLocalSearchParams, useRouter } from "expo-router"
import { clamp, upperFirst } from "lodash";
import { Pressable, useWindowDimensions, View } from "react-native";
import { MediaTvSeriesPerson } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { LegendList } from "@legendapp/list";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { memo, useCallback, useMemo, useState } from "react";
import TvSeriesWidgetSeasons from "@/components/screens/tv-series/TvSeriesWidgetSeasons";
import { useLocale, useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { CardPerson } from "@/components/cards/CardPerson";
import TvSeriesHeader from "@/components/screens/tv-series/TvSeriesHeader";
import TvSeriesWidgetPlaylists from "@/components/screens/tv-series/TvSeriesWidgetPlaylists";
import TvSeriesWidgetReviews from "@/components/screens/tv-series/TvSeriesWidgetReviews";
import { MultiRowHorizontalList } from "@/components/ui/MultiRowHorizontalList";
import { Button } from "@/components/ui/Button";

const TvSeriesScreen = () => {
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { tabBarHeight, bottomTabHeight } = useTheme();
	const t = useTranslations();
	const locale = useLocale();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const {
		data: series,
		isLoading,
		isRefetching,
		refetch,
	} = useMediaTvSeriesDetailsQuery({
		id: seriesId,
		locale: locale,
	});
	const loading = series === undefined || isLoading;
	// States
	const [showFullSynopsis, setShowFullSynopsis] = useState(false);
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
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		onMenuPress={series ? handleMenuPress : undefined}
		/>
		<Animated.ScrollView
		onScroll={scrollHandler}
		scrollToOverflowEnabled
		contentContainerStyle={{
			paddingBottom: bottomTabHeight + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		>
			<TvSeriesHeader
			tvSeries={series}
			loading={loading}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			/>
			{series && <View style={tw`flex-col gap-4`}>
				{/* SYNOPSIS */}
				<Pressable
				style={{ gap: GAP, paddingHorizontal: PADDING_HORIZONTAL }}
				onPress={() => setShowFullSynopsis((prev) => !prev)}
				>
					<Text style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.overview'))}</Text>
					<Text textColor='muted' numberOfLines={showFullSynopsis ? undefined : 5} style={tw.style('text-justify')}>
						{series.overview || upperFirst(t('common.messages.no_overview'))}
					</Text>
				</Pressable>
				<TvSeriesWidgetSeasons seasons={series.seasons || []} containerStyle={tw`px-4`} labelStyle={tw`px-4`} />
				{/* CASTING */}
				<View style={tw.style('gap-1')}> 
					<View style={[{ gap: GAP, paddingHorizontal: PADDING_HORIZONTAL }, tw`flex-row items-center justify-between`]}>
						<Text style={tw`text-lg font-medium`}>{upperFirst(t('common.messages.cast'))}</Text>
						<Link href={{ pathname: '/tv-series/[tv_series_id]/credits', params: { tv_series_id: series.id } }} asChild>
							<Button variant='ghost' size="fit">
								{upperFirst(t('common.messages.show_credit', { count: 2 }))}
							</Button>
						</Link>
					</View>
					{series.cast?.length ? <TvSeriesCast cast={series.cast} /> : <Text textColor='muted' style={tw`px-4`}>{upperFirst(t('common.messages.no_cast'))}</Text>}
				</View>
				<TvSeriesWidgetPlaylists tvSeriesId={series.id} url={series.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`} />
				<TvSeriesWidgetReviews tvSeries={series} url={series.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`} />
			</View>}
		</Animated.ScrollView>
	</>
	)
};

const TvSeriesCast = ({
	cast,
} : {
	cast: MediaTvSeriesPerson[]
}) => {
	const { colors } = useTheme();
	const router = useRouter();
	const { width: screenWidth } = useWindowDimensions();
	const width = useMemo(() => clamp(screenWidth - ((PADDING_HORIZONTAL * 2) + GAP * 2), 400), [screenWidth]);
	const handlePress = useCallback((id: string | number) => {
		router.push({
			pathname: '/person/[person_id]',
			params: { person_id: id.toString() }
		})
	}, [router]);
	const renderItem = useCallback((item: MediaTvSeriesPerson) => (
		<CardPerson variant='list' hideKnownForDepartment person={item.person!}>
			{item.character ? (
				<Text
				numberOfLines={2}
				style={[{ color: colors.accentYellow }, tw`italic text-sm`]}
				>
					{item.character}
				</Text>
			) : null}
		</CardPerson>
	), [handlePress, colors.accentYellow]);
	return (
		<MultiRowHorizontalList<MediaTvSeriesPerson>
		data={cast}
		renderItem={renderItem}
		keyExtractor={useCallback((item) => item.id.toString(), [])}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			gap: GAP,
		}}
		columnStyle={{
			width: width,
			gap: GAP,
		}}
		snapToInterval={width + GAP}
		decelerationRate={"fast"}
		/>
	);
};

export default TvSeriesScreen;