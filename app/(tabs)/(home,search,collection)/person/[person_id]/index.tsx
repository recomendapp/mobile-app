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
import { Slot, useLocalSearchParams } from 'expo-router';
import { Icons } from '@/constants/Icons';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import FilmNav from '@/components/screens/film/FilmNav';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import FilmHeaderTwo from '@/components/screens/film/FilmHeaderTwo';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { ThemedAnimatedView } from '@/components/ui/ThemedAnimatedView';
import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';
import { FlashList } from '@shopify/flash-list';
import { useFilmStore } from '@/stores/filmStore';

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

const PersonScreen = () => {
	const { i18n, t } = useTranslation();
	const { person_id } = useLocalSearchParams();
	const { sv, filmHeaderHeight } = useFilmStore();
	const { id: personId} = getIdFromSlug(person_id as string);
	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: 1100099, // personId,
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

	return (
		<AnimatedFlashList
		// ListHeaderComponent={() => (
		// )}
		data={DATA} style={{ flex: 1 }}
		renderItem={({ item } : { item: any }) => (
			<Animated.View style={[tw`p-4 h-96`, { backgroundColor: getRandomDarkColor() }]}>
				<ThemedText>{item.title}</ThemedText>
			</Animated.View>
		)}
		ListHeaderComponent={() => movie ? (
			<ThemedAnimatedView
			style={[
				tw.style('items-center justify-center z-10 p-2'),
				// stickyElement
			]}
			>
				<FilmNav slug={String(person_id)} />
			</ThemedAnimatedView>
		) : null}
		contentContainerStyle={{
			paddingTop: 461,
		}}
		keyExtractor={(item, index) => index.toString()}
		estimatedItemSize={100}
		onScroll={scrollHandler}
		scrollEventThrottle={16}
		showsVerticalScrollIndicator={false}
		nestedScrollEnabled
		/>
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

export default PersonScreen;