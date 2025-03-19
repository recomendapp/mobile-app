import { ThemedText } from "@/components/ui/ThemedText";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { Link } from "expo-router"
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Media, MediaMoviePerson } from "@/types/type.db";
import { FlashList } from "@shopify/flash-list";
import { CardMedia } from "@/components/cards/CardMedia";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle } from "react-native-reanimated";
import { useFilmContext } from "@/components/screens/film/FilmContext";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";

const FilmScreen = () => {
	const { colors } = useTheme();
	const { i18n, t } = useTranslation();
	const { tabState, movieId, scrollY, headerHeight, addScrollRef } = useFilmContext();
	const tabBarHeight = useBottomTabOverflow();
	const inset = useSafeAreaInsets();
	const scrollRef = useAnimatedRef<Animated.FlatList<any>>();
	const {
		data: movie,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});

	useEffect(() => {
		if (scrollRef.current && tabState) {
			addScrollRef('index', scrollRef);
		}
	}, [scrollRef, tabState]);

	if (!movie) return null;
	if (!tabState) return null;

	return (
	<Animated.FlatList
	scrollToOverflowEnabled
	ref={scrollRef}
	onScroll={scrollHandler}
	contentContainerStyle={{
		paddingTop: headerHeight.get(),
		paddingBottom: tabBarHeight + inset.bottom,
	}}
	ListHeaderComponent={() => (
		<>
			{/* <View style={tw.style('h-96 bg-red-500')} /> */}
			{/* SYNOPSIS */}
			<View style={tw.style('gap-1')}>
				<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.word.overview'))}</ThemedText>
				<ThemedText style={[{ color: colors.mutedForeground }, tw.style('text-justify')]}>
					{movie.extra_data.overview ?? upperFirst(t('common.messages.no_overview'))}
				</ThemedText>
			</View>
			{/* CASTING */}
			<View style={tw.style('gap-1')}> 
				<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</ThemedText>
				{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <ThemedText style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_cast'))}</ThemedText>}
			</View>

			<View style={tw.style('gap-1')}> 
				<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</ThemedText>
				{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <ThemedText style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_cast'))}</ThemedText>}
			</View>
			<View style={tw.style('gap-1')}> 
				<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</ThemedText>
				{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <ThemedText style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_cast'))}</ThemedText>}
			</View>
			<View style={tw.style('gap-1')}> 
				<ThemedText style={tw.style('text-lg font-medium')}>{upperFirst(t('common.messages.cast'))}</ThemedText>
				{movie.cast?.length ? <FilmCast cast={movie.cast} /> : <ThemedText style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_cast'))}</ThemedText>}
			</View>
		</>
	)}
	showsVerticalScrollIndicator={false}
	data={[null]}
	renderItem={() => null}
	/>
	)
};

const FilmCast = ({
	cast,
} : {
	cast: MediaMoviePerson[]
}) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	return (
		<FlashList
		data={cast}
		renderItem={({ item, index }) => {
			if (!item.person) return null;
			return (
			<Link key={index} href={`/person/${item.person?.id}`} asChild>
				<View style={tw.style('gap-2 w-32')}>
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
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={cast.length}
		showsHorizontalScrollIndicator={false}
		horizontal
		ItemSeparatorComponent={() => <View style={tw.style('w-2')} />}
		nestedScrollEnabled
		/>
	)
}

export default FilmScreen;