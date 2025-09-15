import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { Href, Link, useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable, View } from "react-native";
import { MediaTvSeriesPerson } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { LegendList } from "@legendapp/list";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useState } from "react";
import TvSeriesWidgetSeasons from "@/components/screens/tv-series/TvSeriesWidgetSeasons";
import { RefreshControl } from "react-native-gesture-handler";
import { useLocale, useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { PADDING_VERTICAL } from "@/theme/globals";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { CardPerson } from "@/components/cards/CardPerson";
import TvSeriesHeader from "@/components/screens/tv-series/TvSeriesHeader";
import TvSeriesWidgetPlaylists from "@/components/screens/tv-series/TvSeriesWidgetPlaylists";
import TvSeriesWidgetReviews from "@/components/screens/tv-series/TvSeriesWidgetReviews";

const TvSeriesScreen = () => {
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { bottomTabHeight } = useTheme();
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

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: series?.name || '',
			headerTransparent: true,
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		onMenuPress={series ? () => {
			openSheet(BottomSheetTvSeries, {
				tvSeries: series,
			})
		} : undefined}
		/>
		<Animated.ScrollView
		onScroll={scrollHandler}
		scrollToOverflowEnabled
		contentContainerStyle={[
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
			},
		]}
		refreshControl={
			<RefreshControl
				refreshing={isRefetching}
				onRefresh={refetch}
			/>
		}
		>
			<TvSeriesHeader
			tvSeries={series}
			loading={loading}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			/>
			{series && <View style={tw.style('flex-col gap-4')}>
				{/* SYNOPSIS */}
				<Pressable
				style={tw.style('gap-1 px-4')}
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
					<Text style={tw.style('px-4 text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</Text>
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
	return (
		<LegendList
		data={cast}
		renderItem={({ item, index }) => {
			if (!item.person) return null;
			return (
			<Link key={index} href={`/person/${item.person?.id}`} asChild>
				<View style={tw.style('gap-2 w-24')}>
					<CardPerson
					key={item.id}
					variant='poster'
					person={item.person}
					style={tw.style('w-full')}
					/>
					<View style={tw.style('flex-col gap-1 items-center')}>
						<Text numberOfLines={2}>{item.person?.name}</Text>
						{item.character ? <Text numberOfLines={2} style={[{ color: colors.accentYellow }, tw.style('italic text-sm')]}>{item.character}</Text> : null}
					</View>
				</View>
			</Link>
			)
		}}
    	snapToInterval={104}
		contentContainerStyle={tw`px-4`}
		keyExtractor={(item) => item.id.toString()}
		showsHorizontalScrollIndicator={false}
		horizontal
		ItemSeparatorComponent={() => <View style={tw.style('w-2')} />}
		nestedScrollEnabled
		/>
	);
};

export default TvSeriesScreen;