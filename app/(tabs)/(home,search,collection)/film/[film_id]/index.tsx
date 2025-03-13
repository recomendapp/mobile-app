import * as React from 'react';
import {
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import FilmNav from '@/components/screens/film/FilmNav';
import { ThemedText } from '@/components/ui/ThemedText';
import tw from '@/lib/tw';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';
import { FlashList } from '@shopify/flash-list';
import FilmHeader from '@/components/screens/film/FilmHeaderTwo';
import FilmHeaderTop from '@/components/screens/film/FilmHeaderTop';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList)

const DATA = [
	{
	  title: "First Item",
	},
	{
	  title: "Second Item",
	},
	{
		title: "Third Item",
	},
	{
		title: "Fourth Item",
	},
	{
		title: "Fifth Item",
	}
];

const FilmScreen = () => {
	const { i18n, t } = useTranslation();
	const { film_id  } = useLocalSearchParams();
	const sv = useSharedValue<number>(0);
	const headerHeight = useSharedValue<number>(0);
	const filmHeaderHeight = useSharedValue<number>(0);
	const { id: movieId } = getIdFromSlug(film_id as string);
	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const loading = isLoading || movie === undefined;

	const tabBarHeight = useBottomTabOverflow();
	const inset = useSafeAreaInsets();
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			sv.value = event.contentOffset.y;
		},
	});

	const animatedScrollStyle = useAnimatedStyle(() => {
		return {
		marginTop: filmHeaderHeight.get(),
		paddingBottom: tabBarHeight + inset.bottom,
		};
	});
	const stickyElement = useAnimatedStyle(() => {
		return {
		transform: [
			{
			translateY: interpolate(
				sv.get(),
				[
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) - 1,
				filmHeaderHeight.get() - (headerHeight.get() + inset.top),
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[0, 0, 1],
			),
			},
		],
		};
	});

	return (
		<>
			<FilmHeaderTop
			filmHeaderHeight={filmHeaderHeight}
			headerHeight={headerHeight}
			onHeaderHeight={(height) => {
				'worklet';
				headerHeight.value = height;
			}}
			sv={sv}
			title={movie?.title ?? ''}
			/>
			<AnimatedFlashList
			ListHeaderComponent={() => (
				<>
					<FilmHeader
					filmHeaderHeight={filmHeaderHeight}
					onHeaderHeight={(height) => {
						'worklet';
						filmHeaderHeight.value = height;
					}}
					headerHeight={headerHeight}
					sv={sv}
					movie={movie}
					loading={loading}
					/>
					{movie ? <>
						<ThemedAnimatedView
						style={[
							tw.style('w-full items-center justify-center z-10 p-2'),
							stickyElement
						]}
						>
							<FilmNav slug={String(film_id)} />
						</ThemedAnimatedView>
					</> : null}
				</>
			)}
			data={DATA}
			renderItem={({ item } : { item: any }) => (
				<Animated.View style={[tw`p-4 h-96`, { backgroundColor: getRandomDarkColor() }]}>
					<ThemedText>{item.title}</ThemedText>
				</Animated.View>
			)}
			keyExtractor={(item, index) => index.toString()}
			estimatedItemSize={100}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			showsVerticalScrollIndicator={false}
			nestedScrollEnabled
			/>
		</>
	);
};

const getRandomDarkColor = () => {
	const min = 20; // Valeur minimale pour rester sombre
	const max = 100; // Valeur maximale pour éviter d'être trop clair
	const r = Math.floor(Math.random() * (max - min + 1)) + min;
	const g = Math.floor(Math.random() * (max - min + 1)) + min;
	const b = Math.floor(Math.random() * (max - min + 1)) + min;
	return `rgba(${r}, ${g}, ${b}, 0.8)`;
};

export default FilmScreen;