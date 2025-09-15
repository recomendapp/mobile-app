import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { Href, Link, useLocalSearchParams } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable, View } from "react-native";
import { MediaMoviePerson } from "@recomendapp/types";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { LegendList } from "@legendapp/list";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useState, useCallback, useMemo, memo } from "react";
import { RefreshControl } from "react-native-gesture-handler";
import { useLocale, useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { PADDING_VERTICAL } from "@/theme/globals";
import MovieHeader from "@/components/screens/film/MovieHeader";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import MovieWidgetReviews from "@/components/screens/film/MovieWidgetReviews";
import MovieWidgetPlaylists from "@/components/screens/film/MovieWidgetPlaylists";
import { CardPerson } from "@/components/cards/CardPerson";

const FilmScreen = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { bottomTabHeight } = useTheme();
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
				style={tw`gap-1 px-4`}
				onPress={toggleSynopsis}
				>
					<Text style={tw`text-lg font-medium`}>{upperFirst(t('common.messages.overview'))}</Text>
					<Text textColor='muted' numberOfLines={showFullSynopsis ? undefined : 5} style={tw.style('text-justify')}>
						{movie?.overview || upperFirst(t('common.messages.no_overview'))}
					</Text>
				</Pressable>
				{/* CASTING */}
				<View style={tw`gap-1`}> 
					<Text style={tw`px-4 text-lg font-medium`}>{upperFirst(t('common.messages.cast'))}</Text>
					{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <Text textColor='muted' style={tw`px-4`}>{upperFirst(t('common.messages.no_cast'))}</Text>}
				</View>
				<MovieWidgetPlaylists movieId={movie.id!} url={movie.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`}/>
				<MovieWidgetReviews movie={movie} url={movie.url as Href} containerStyle={tw`px-4`} labelStyle={tw`px-4`}/>
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
	const renderItem = useCallback(({ item, index }: { item: MediaMoviePerson; index: number }) => {
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
						{item.role?.character ? (
							<Text 
								numberOfLines={2} 
								style={[{ color: colors.accentYellow }, tw.style('italic text-sm')]}
							>
								{item.role?.character}
							</Text>
						) : null}
					</View>
				</View>
			</Link>
		);
	}, [colors.accentYellow]);
	const keyExtractor = useCallback((item: MediaMoviePerson) => item.id.toString(), []);
	const ItemSeparatorComponent = useCallback(() => <View style={tw.style('w-2')} />, []);
	return (
		<LegendList
			data={cast}
			renderItem={renderItem}
			snapToInterval={104}
			contentContainerStyle={tw`px-4`}
			keyExtractor={keyExtractor}
			showsHorizontalScrollIndicator={false}
			horizontal
			ItemSeparatorComponent={ItemSeparatorComponent}
			nestedScrollEnabled
		/>
	);
});

export default FilmScreen;