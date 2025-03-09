import { ThemedText } from "@/components/ui/ThemedText"
import {  Slot, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/context/AuthProvider";
import {  View, Text, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import FilmNav from "@/components/screens/film/FilmNav";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import HeaderParallaxScrollView from "@/components/ui/HeaderParallaxScrollView";
import { ThemedView } from "@/components/ui/ThemedView";
import Animated, { useSharedValue } from "react-native-reanimated";
import { Image } from "react-native";
import { ImageBackground } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@react-navigation/native";

const FilmLayout = () => {
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { id: movieId} = getIdFromSlug(film_id as string);

	const {
		data: movie,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});

	const loading = isLoading || movie === undefined;

	const refresh = () => {
		refetch();
	};

	return (
		// <HeaderParallaxScrollView
		// headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
		// backgroundImage={movie?.backdrop_url ?? undefined}
		// headerContent={
		// 	<View className="flex-1 justify-center items-center bg-blue-400">
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 		<ThemedText>{movie?.title}</ThemedText>
		// 	</View>
		// }
		// >
		<ThemedView className="flex-1">
			{(loading || movie) ? (
				<ScrollView
				contentContainerClassName="flex-1 gap-4"
				refreshControl={
					<RefreshControl
					  refreshing={isRefetching}
					  onRefresh={refresh}
					/>
				}
				nestedScrollEnabled
				>
					<FilmHeader />
					{!loading ? (
						<>
						<FilmNav slug={String(film_id)} />
						<Slot />
						</>
					) : (
						<ActivityIndicator />
					)}
				</ScrollView>
			) : (
				<ScrollView
				contentContainerClassName="flex-1 justify-center items-center"
				refreshControl={
					<RefreshControl
					  refreshing={isRefetching}
					  onRefresh={refresh}
					/>
				}
				>
					{/* <Icons.user className="text-foreground" size={50} /> */}
					<ThemedText>{upperFirst(t('common.errors.film_not_found'))}</ThemedText>
				</ScrollView>
			)}
		</ThemedView>
		// </HeaderParallaxScrollView>
	)
};


const FilmHeader = () => {
	const { user } = useAuth();
	const navigation = useNavigation();
	const { film_id } = useLocalSearchParams();
	const { id: movieId} = getIdFromSlug(film_id as string);
	const { i18n } = useTranslation();
	const y = useSharedValue(0);
	const {
		data: movie,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});

	const loading = isLoading || movie === undefined;
	
	return (
		<SafeAreaView className="bg-red-500 px-2">
			<Button variant={'ghost'} size={'icon'} onPress={() => navigation.goBack()} className="rounded-full py-0">
				<Icons.ChevronLeft size={20} className="text-foreground"/>
			</Button>
			{/* {movie?.avatar_url ?<Animated.View className={'absolute top-0 left-0'}>
				<ImageWithFallback source={{uri: movie?.avatar_url}} alt="ok" />
				<Animated.View className={'bg-black opacity-60'}/>
			</Animated.View> : null}
			<SafeAreaView className="flex flex-row items-center gap-2">
				<ThemedText>movie: {movie?.title}</ThemedText>
			</SafeAreaView> */}
		</SafeAreaView>
	)
};

export default FilmLayout;