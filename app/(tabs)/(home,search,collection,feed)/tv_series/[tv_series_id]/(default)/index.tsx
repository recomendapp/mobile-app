import { ThemedText } from "@/components/ui/ThemedText";
import { useMediaTvSeriesDetailsQuery } from "@/features/media/mediaQueries";
import { Href, Link, useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable, View } from "react-native";
import { Media, MediaTvSeriesPerson } from "@/types/type.db";
import { CardMedia } from "@/components/cards/CardMedia";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { LegendList } from "@legendapp/list";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import HeaderOverlay from "@/components/ui/HeaderOverlay";
import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useState } from "react";
import MediaWidgetPlaylists from "@/components/screens/media/MediaWidgetPlaylists";
import MediaWidgetReviews from "@/components/screens/media/MediaWidgetReviews";
import MediaHeader from "@/components/screens/media/MediaHeader";
import TvSeriesWidgetSeasons from "@/components/screens/media/TvSeries/TvSeriesWidgetSeasons";
import { RefreshControl } from "react-native-gesture-handler";
import { useLocale, useTranslations } from "use-intl";

const PADDING_BOTTOM = 8;

const TvSeriesScreen = () => {
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId } = getIdFromSlug(tv_series_id);
	const { colors, inset } = useTheme();
	const t = useTranslations();
	const locale = useLocale();
	const { openSheet } = useBottomSheetStore();
	const bottomTabBarHeight = useBottomTabOverflow();
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
		<HeaderOverlay
		triggerHeight={headerHeight}
		headerHeight={headerOverlayHeight}
		onHeaderHeight={(height) => {
			'worklet';
			headerOverlayHeight.value = height;
		}}
		scrollY={scrollY}
		title={series?.title ?? ''}
		onMenuPress={series ? () => {
			openSheet(BottomSheetMedia, {
				media: series as Media,
			})
		} : undefined}
		/>
		<Animated.ScrollView
		onScroll={scrollHandler}
		scrollToOverflowEnabled
		contentContainerStyle={[
			{
				paddingBottom: bottomTabBarHeight + inset.bottom + PADDING_BOTTOM,
			},
		]}
		refreshControl={
			<RefreshControl
				refreshing={isRefetching}
				onRefresh={refetch}
			/>
		}
		>
			<MediaHeader
			media={series as Media}
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
					<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.overview'))}</ThemedText>
					<ThemedText numberOfLines={showFullSynopsis ? undefined : 5} style={[{ color: colors.mutedForeground }, tw.style('text-justify')]}>
						{series.extra_data.overview ?? upperFirst(t('common.messages.no_overview'))}
					</ThemedText>
				</Pressable>
				<TvSeriesWidgetSeasons seasons={series.seasons || []} containerStyle={tw`px-4`} labelStyle={tw`px-4`} />
				{/* CASTING */}
				<View style={tw.style('gap-1')}> 
					<ThemedText style={tw.style('px-4 text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</ThemedText>
					{series.cast?.length ? <TvSeriesCast cast={series.cast} /> : <ThemedText style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_cast'))}</ThemedText>}
				</View>
				<MediaWidgetPlaylists mediaId={series.media_id!} url={series.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`} />
				<MediaWidgetReviews mediaId={series.media_id!} url={series.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`} />
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
					<CardMedia
					key={item.id}
					variant='poster'
					media={item.person as Media}
					index={index}
					style={tw.style('w-full')}
					/>
					<View style={tw.style('flex-col gap-1 items-center')}>
						<ThemedText numberOfLines={2}>{item.person?.title}</ThemedText>
						{item.character ? <ThemedText numberOfLines={2} style={[{ color: colors.accentYellow }, tw.style('italic text-sm')]}>{item.character}</ThemedText> : null}
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