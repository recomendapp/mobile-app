import { ThemedText } from "@/components/ui/ThemedText";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { Href, Link, useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable, View } from "react-native";
import { Media, MediaMoviePerson } from "@/types/type.db";
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
import { RefreshControl } from "react-native-gesture-handler";
import { useLocale, useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";

const PADDING_BOTTOM = 8;

const FilmScreen = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { colors, inset } = useTheme();
	const locale = useLocale();
	const t = useTranslations();
	const { openSheet } = useBottomSheetStore();
	const bottomTabBarHeight = useBottomTabOverflow();
	const {
		data: movie,
		isLoading,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: locale,
	});
	const loading = movie === undefined || isLoading;
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
		title={movie?.title ?? ''}
		onMenuPress={movie ? () => {
			openSheet(BottomSheetMedia, {
				media: movie as Media,
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
			media={movie as Media}
			loading={loading}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			/>
			{movie && <View style={tw.style('flex-col gap-4')}>
				{/* SYNOPSIS */}
				<Pressable
				style={tw.style('gap-1 px-4')}
				onPress={() => setShowFullSynopsis((prev) => !prev)}
				>
					<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.overview'))}</ThemedText>
					<ThemedText numberOfLines={showFullSynopsis ? undefined : 5} style={[{ color: colors.mutedForeground }, tw.style('text-justify')]}>
						{movie.extra_data.overview ?? upperFirst(t('common.messages.no_overview'))}
					</ThemedText>
				</Pressable>
				{/* CASTING */}
				<View style={tw.style('gap-1')}> 
					<ThemedText style={tw.style('px-4 text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</ThemedText>
					{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <Text style={tw`px-4`}>{upperFirst(t('common.messages.no_cast'))}</Text>}
				</View>
				<MediaWidgetPlaylists mediaId={movie.media_id!} url={movie.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`}/>
				<MediaWidgetReviews mediaId={movie.media_id!} url={movie.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`}/>
			</View>}
		</Animated.ScrollView>
	</>
	)
};

const FilmCast = ({
	cast,
} : {
	cast: MediaMoviePerson[]
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
						{item.role?.character ? <ThemedText numberOfLines={2} style={[{ color: colors.accentYellow }, tw.style('italic text-sm')]}>{item.role?.character}</ThemedText> : null}
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

export default FilmScreen;