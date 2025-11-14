import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { Href, Link, useLocalSearchParams, useRouter } from "expo-router"
import { clamp, upperFirst } from "lodash";
import { Pressable, useWindowDimensions } from "react-native";
import { MediaMoviePerson } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useState, useCallback, useMemo } from "react";
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
import { MultiRowHorizontalList } from "@/components/ui/MultiRowHorizontalList";
import { Button } from "@/components/ui/Button";

const FilmScreen = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { tabBarHeight, bottomOffset} = useTheme();
	const locale = useLocale();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: locale,
	});

	const loading = movie === undefined || isLoading;

	// States
	const [showFullSynopsis, setShowFullSynopsis] = useState(false);

	// SharedValue
	const headerHeight = useSharedValue<number>(0);
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
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		>
			<MovieHeader
			movie={movie}
			loading={loading}
			scrollY={scrollY}
			triggerHeight={headerHeight}
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
					<View style={[{ gap: GAP, paddingHorizontal: PADDING_HORIZONTAL }, tw`flex-row items-center justify-between`]}>
						<Text style={tw`text-lg font-medium`}>{upperFirst(t('common.messages.cast'))}</Text>
						<Link href={{ pathname: '/film/[film_id]/credits', params: { film_id } }} asChild>
							<Button variant='ghost' size="fit">
								{upperFirst(t('common.messages.show_credit', { count: 2 }))}
							</Button>
						</Link>
					</View>
					{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <Text textColor='muted' style={{ paddingHorizontal: PADDING_HORIZONTAL }}>{upperFirst(t('common.messages.no_cast'))}</Text>}
				</View>
				<MovieWidgetPlaylists movieId={movie.id!} url={movie.url as Href} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}/>
				<MovieWidgetReviews movie={movie} url={movie.url as Href} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}/>
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
	const router = useRouter();
	const { width: screenWidth } = useWindowDimensions();
	const width = useMemo(() => clamp(screenWidth - ((PADDING_HORIZONTAL * 2) + GAP * 2), 400), [screenWidth]);
	const handlePress = useCallback((id: string | number) => {
		router.push({
			pathname: '/person/[person_id]',
			params: { person_id: id.toString() }
		})
	}, [router]);
	const renderItem = useCallback((item: MediaMoviePerson) => (
		<CardPerson variant='list' hideKnownForDepartment person={item.person!}>
			{item.role?.character ? (
				<Text
				numberOfLines={2}
				style={[{ color: colors.accentYellow }, tw`italic text-sm`]}
				>
					{item.role?.character}
				</Text>
			) : null}
		</CardPerson>
	), [handlePress, colors.accentYellow]);
	return (
		<MultiRowHorizontalList<MediaMoviePerson>
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
	)
};

export default FilmScreen;