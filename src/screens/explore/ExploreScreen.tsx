import { Callout, Camera, MapView, MarkerView, OnPressEvent, PointAnnotation, ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";
import styleJSON from "@/assets/map/style.json";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BORDER_RADIUS, BORDER_RADIUS_ROUNDED, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BottomSheet from "@/components/ui/BottomSheet";
import { BottomSheetSearchbar } from "@/components/ui/BottomSheetSearchbar";
import { useQuery } from "@tanstack/react-query";
import { exploreTileOptions } from "@/api/options";
import { mediaGenresOptions } from "@/api/options/medias";
import { ExploreTile } from "@recomendapp/types";
import Color from "color";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useSharedValue } from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import { SearchBottomSheet } from "./sheets/SearchBottomSheet";
import { LocationDetailsBottomSheet, LocationDetailsBottomSheetMethods } from "./sheets/LocationDetailsBottomSheet";

export const ExploreScreen = () => {
	const router = useRouter();
	const { colors, bottomOffset } = useTheme();
	const cameraRef = useRef(null);
	const sheet = useRef<BottomSheet>(null);
	const [userPosition, setUserPosition] = useState({
		latitude: 48.5,
		longitude: 2.5,
		zoomLevel: 8,
	});
	
	const { height: screenHeight } = useWindowDimensions();
	
	// REFs
	const searchRef = useRef<BottomSheetModal>(null);
	const locationDetailsRef = useRef<LocationDetailsBottomSheetMethods>(null);
	
	// SharedValues
	const animatedPOIListIndex = useSharedValue<number>(0);
	const animatedPOIListPosition = useSharedValue<number>(screenHeight);
	const animatedPOIDetailsIndex = useSharedValue<number>(0);
	const animatedPOIDetailsPosition = useSharedValue<number>(screenHeight);
	
	// States
	const [selectedMovie, setSelectedMovie] = useState<ExploreTile['features'][number] | null>(null);
	
	const mapInitialCamera = useMemo(
		() => ({
			center: {
				latitude: 48.5,
				longitude: 2.5,
			},
			heading: 0,
			pitch: 0,
			zoom: 8,
			altitude: 40000,
		}),
		[]
	);
	const baseZoom = 8;

	const {
		data: genres,
	} = useQuery(mediaGenresOptions());

	const {
		data: tile,
	} = useQuery(exploreTileOptions({ exploreId: 1 }));

	const handleOnLocationPress = useCallback((e: OnPressEvent) => {
		const location = e.features.at(0) as ExploreTile['features'][number];
		if (!location) return;
		setSelectedMovie(location);
	}, []);

	const handleOnLocationClose = useCallback(() => {
		setSelectedMovie(null);
	}, []);

	useEffect(() => {
		if (selectedMovie) {
			locationDetailsRef.current?.present(selectedMovie.properties);
		}
	}, [selectedMovie]);

	useLayoutEffect(() => {
		requestAnimationFrame(
			() => {
				searchRef.current?.present()
			}
		);
	}, []);

	return (
	<BottomSheetModalProvider>
		<Stack.Screen
		options={{
			headerTitle: () => <></>,
			headerShown: true,
			headerTransparent: true,
			headerStyle: {
				backgroundColor: 'transparent',
			},
			headerLeft: () => (
				<View>
					<Button variant="muted" icon={Icons.ChevronLeft} size="icon" style={{ borderRadius: BORDER_RADIUS_ROUNDED }} onPress={() => router.canGoBack() ? router.back() : router.replace({ pathname: '/(tabs)/(home)'})} />
				</View>
			)
		}}
		/>
		<MapView
		style={{ flex: 1 }}
		mapStyle={styleJSON}
		>
			<Camera
			ref={cameraRef}
			defaultSettings={{
				centerCoordinate: [userPosition.longitude, userPosition.latitude],
				zoomLevel: userPosition.zoomLevel,
			}}
			/>
			{genres && tile && (
				<ShapeSource
				id="explore-points"
				shape={tile}
				onPress={handleOnLocationPress}
				>
					<SymbolLayer
					id="movies"
					filter={[
						'!=',
						['get', 'id', ['get', 'movie']],
						selectedMovie?.properties.movie.id ?? -1
					]}
					style={{
						// TEXT
						textField: ['get', 'title', ['get', 'movie']],
						textFont: ['Open Sans Bold'],
						textSize: [
							"interpolate",
							["exponential", 2],
							["zoom"],
							0,
							1.5 * Math.pow(2, 0 - baseZoom),
							24,
							1.5 * Math.pow(2, 24 - baseZoom)
						],
						textAllowOverlap: true,
						textVariableAnchor: ['left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
						textOffset: [1, 0],
						textColor: [
							'case',
							['==', ['get', 'id', ['get', 'movie']], selectedMovie?.properties.movie.id ?? -1],
							Color(colors.accentBlue).hex(),
							Color(colors.accentYellow).hex(),
						],
						textHaloColor: 'black',
						textHaloWidth: [
							'interpolate',
							['exponential', 2],
							['zoom'],
							0,
							0.01 * Math.pow(2, 0 - baseZoom),
							24,
							0.01 * Math.pow(2, 24 - baseZoom)
						],
						textHaloBlur: 1,
						// ICON
						iconImage: [
							'match',
							['get', 'id', ['at', 0, ['get', 'genres', ['get', 'movie']]]],
							...genres.flatMap(({ id }) => [id, `genres/${id}`]),
							'none'
						],
						iconSize: [
							"interpolate",
							["exponential", 2],
							["zoom"],
							0,
							0.08 * Math.pow(2, 0 - baseZoom),
							24,
							0.08 * Math.pow(2, 24 - baseZoom)
						]
					}}
					/>
				</ShapeSource>
			)}
			{selectedMovie && (
				<MarkerView
				id={`selected-movie-${selectedMovie.properties.movie.id}`}
				coordinate={[selectedMovie.geometry.coordinates[0], selectedMovie.geometry.coordinates[1]]}
				anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center
				>
					<View style={{ alignItems: 'center', justifyContent: 'center' }}>
						{/* <View style={{ backgroundColor: colors.muted, padding: PADDING_VERTICAL, borderRadius: BORDER_RADIUS }}> */}
							<Text>{selectedMovie.properties.movie.title}</Text>
						{/* </View> */}
						<Icons.MapPin color={'rgba(136, 0, 0, 1)'} fill={'rgba(255, 0, 0, 1)'} size={32} />
					</View>
				</MarkerView>
			)}
		</MapView>

		<SearchBottomSheet
		ref={searchRef}
		index={animatedPOIListIndex}
		position={animatedPOIListPosition}
		onItemPress={(item) => {
			setSelectedMovie(item);
		}}
		/>
		<LocationDetailsBottomSheet
        ref={locationDetailsRef}
        index={animatedPOIDetailsIndex}
        position={animatedPOIDetailsPosition}
		// onClose={handleOnLocationClose}
      	/>
	</BottomSheetModalProvider>
	);
};