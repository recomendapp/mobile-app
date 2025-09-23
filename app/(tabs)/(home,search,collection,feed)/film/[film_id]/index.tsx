import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { Href, useLocalSearchParams, useRouter } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable } from "react-native";
import { MediaMoviePerson } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { LegendList } from "@legendapp/list";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useState, useCallback, useMemo, memo } from "react";
import { useLocale, useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import MovieHeader from "@/components/screens/film/MovieHeader";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import MovieWidgetReviews from "@/components/screens/film/MovieWidgetReviews";
import MovieWidgetPlaylists from "@/components/screens/film/MovieWidgetPlaylists";
import { CardPerson } from "@/components/cards/CardPerson";
import { View } from "@/components/ui/view";

const FilmScreen = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { tabBarHeight, bottomTabHeight} = useTheme();
	const locale = useLocale();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

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
			scrollY.value = event.contentOffset.y;
		},
	});

	const toggleSynopsis = useCallback(() => {
		setShowFullSynopsis((prev) => !prev);
	}, []);

	const handleMenuPress = useCallback(() => {
		if (movie) {
			openSheet(BottomSheetMovie, {
				movie: movie,
			});
		}
	}, [movie, openSheet]);

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: movie?.title || '',
			headerTransparent: true,
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		onMenuPress={movie ? handleMenuPress : undefined}
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
			<MovieHeader
			movie={movie}
			loading={loading}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			/>
			{movie && <View style={tw`flex-col gap-4`}>
				{/* SYNOPSIS */}
				<Pressable
				style={[tw`gap-1`, { paddingHorizontal: PADDING_HORIZONTAL }]}
				onPress={toggleSynopsis}
				>
					<Text style={tw`text-lg font-medium`}>{upperFirst(t('common.messages.overview'))}</Text>
					<Text textColor='muted' numberOfLines={showFullSynopsis ? undefined : 5} style={tw`text-justify`}>
						{movie?.overview || upperFirst(t('common.messages.no_overview'))}
					</Text>
				</Pressable>
				{/* CASTING */}
				<View style={tw`gap-1`}> 
					<Text style={[{ paddingHorizontal: PADDING_HORIZONTAL }, tw`text-lg font-medium`]}>{upperFirst(t('common.messages.cast'))}</Text>
					{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <Text textColor='muted' style={{ paddingHorizontal: PADDING_HORIZONTAL }}>{upperFirst(t('common.messages.no_cast'))}</Text>}
				</View>
				<MovieWidgetPlaylists movieId={movie.id!} url={movie.url as Href} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}/>
				<MovieWidgetReviews movie={movie} url={movie.url as Href} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}/>
			</View>}
		</Animated.ScrollView>
	</>
	)
};

const FilmCast = memo(({
	cast,
} : {
	cast: MediaMoviePerson[]
}) => {
	const { colors } = useTheme();
	const router = useRouter();

	const handlePress = useCallback((id: string | number) => {
		router.push({
			pathname: '/person/[person_id]',
			params: { person_id: id.toString() }
		})
	}, [router]);
	const renderItem = useCallback(({ item }: { item: MediaMoviePerson; index: number }) => {
		if (!item.person) return null;
		return (
			<Pressable onPress={() => handlePress(item.person?.id!)} style={[{ gap: GAP }, tw`w-24`]}>
				<CardPerson
					key={item.id}
					variant='poster'
					person={item.person}
					style={tw`w-full`}
				/>
				<View style={tw`flex-col gap-1 items-center`}>
					<Text numberOfLines={2}>{item.person?.name}</Text>
					{item.role?.character ? (
						<Text
							numberOfLines={2}
							style={[{ color: colors.accentYellow }, tw`italic text-sm`]}
						>
							{item.role?.character}
						</Text>
					) : null}
				</View>
			</Pressable>
		);
	}, [colors.accentYellow, handlePress]);
	return (
		<LegendList
		data={cast}
		renderItem={renderItem}
		snapToInterval={104}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			gap: GAP,
		}}
		keyExtractor={useCallback((item: MediaMoviePerson) => item.id.toString(), [])}
		showsHorizontalScrollIndicator={false}
		horizontal
		nestedScrollEnabled
		/>
	);
});

export default FilmScreen;