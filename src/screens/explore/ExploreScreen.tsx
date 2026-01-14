import { Camera, CameraRef, MapView, MapViewRef, MarkerView, OnPressEvent, ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";
import styleJSON from "@/assets/map/style.json";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BORDER_RADIUS, BORDER_RADIUS_FULL, GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ExploreTile } from "@recomendapp/types";
import Color from "color";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import { SearchBottomSheet } from "./sheets/SearchBottomSheet";
import { LocationDetailsBottomSheet, LocationDetailsBottomSheetMethods } from "./sheets/LocationDetailsBottomSheet";
import { withModalProvider } from "@/components/utils/withModalProvider";
import { useHeaderHeight } from "@react-navigation/elements";
import { FiltersBottomSheet } from "./sheets/FiltersBottomSheet";
import { useExploreStore } from "@/stores/useExploreStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMediaGenresQuery } from "@/api/medias/mediaQueries";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Input } from "@/components/ui/Input";
import { useExploreTileMetaQuery, useExploreTileQuery } from "@/api/explore/exploreQueries";
import { useUIStore } from "@/stores/useUIStore";

const MOVE_DELAY = 500;

const ExploreScreen = () => {
	const router = useRouter();
	const filters = useExploreStore((state) => state.filters);
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	
	const headerHeight = useHeaderHeight();
	const { height: screenHeight } = useWindowDimensions();
	
	// REFs
	const mapRef = useRef<MapViewRef>(null);
	const cameraRef = useRef<CameraRef>(null);
	const searchRef = useRef<TrueSheet>(null);
	const locationDetailsRef = useRef<LocationDetailsBottomSheetMethods>(null);
	
	// SharedValues
	const animatedPOIListIndex = useSharedValue(0);
	const animatedPOIListPosition = useSharedValue(screenHeight);
	const animatedPOIDetailsIndex = useSharedValue(0);
	const animatedPOIDetailsPosition = useSharedValue(screenHeight);
	const animatedFiltersIndex = useSharedValue(0);
	const animatedFiltersPosition = useSharedValue(screenHeight);
	const optionsHeight = useSharedValue(0);
	
	// States
	const { map, setMapCamera } = useUIStore((state) => state);
	const [selectedMovie, setSelectedMovie] = useState<ExploreTile['features'][number] | null>(null);
	const [showRecenter, setShowRecenter] = useState(false);
	
	const baseZoom = 8;

	const {
		data: genres,
	} = useMediaGenresQuery();

	const {
		data: tile,
		refetch: refetchTile
	} = useExploreTileQuery({ exploreId: 1 });
	const { data: tileMeta } = useExploreTileMetaQuery({ exploreId: 1 });

	// Handlers
	const handleSaveCameraPosition = useCallback(async () => {
		if (!mapRef.current) return;
		try {
			const center = await mapRef.current.getCenter();
			const zoom = await mapRef.current.getZoom();

			const lng = center[0];
			const lat = center[1];

			setMapCamera([lng, lat], zoom);
		} catch (error) {
			console.error('Error getting camera position:', error);
		}
	}, [setMapCamera]);

	const handleOnLocationPress = useCallback((e: OnPressEvent) => {
		const location = e.features.at(0) as ExploreTile['features'][number];
		if (!location) return;
		setSelectedMovie(location);
	}, []);

	const handleOnSearchItemPress = useCallback((item: ExploreTile['features'][number]) => {
		setSelectedMovie(item);
	}, []);
 
	const handleOnLocationClose = useCallback(() => {
		setSelectedMovie(null);
	}, []);

	// Styles
	const animatedOptionsStyle = useAnimatedStyle(() => {
		const activeSheetY = Math.min(
			animatedPOIListPosition.get(),
			animatedPOIDetailsPosition.get(),
			animatedFiltersPosition.get()
		);
		const B = insets.bottom + PADDING_VERTICAL;				// bottom safe area + padding 
		const H = optionsHeight.get();							// Options height
		const top0 = screenHeight - (B + H);					// 
		const bottomOffset = screenHeight - activeSheetY;		// hauteur visible de la sheet

		const dDesired = bottomOffset - B + PADDING_VERTICAL;	// coller au-dessus de la sheet
		const dMax = top0 - (headerHeight + PADDING_VERTICAL);	// ne pas dépasser le header
		const d = Math.max(0, Math.min(dDesired, dMax));		// clamp

		return { transform: [{ translateY: -d }] };
	});

	// useEffects
	useEffect(() => {
		if (selectedMovie) {
			cameraRef.current?.flyTo(selectedMovie.geometry.coordinates, MOVE_DELAY);
			locationDetailsRef.current?.present(selectedMovie.properties);
		}
		setShowRecenter(false);
	}, [selectedMovie]);

	useEffect(() => {
		if (tile && tileMeta && tile.updated_at !== tileMeta.updated_at) {
			refetchTile();
		}
	}, [tile, tileMeta, refetchTile]);

	useLayoutEffect(() => {
		return () => {
			searchRef.current?.dismiss();
		}
	}, []);

	return (
	<>
		{/* <Stack.Screen
		options={{
			headerTitle: () => <></>,
			headerShown: true,
			headerTransparent: true,
			headerStyle: {
				backgroundColor: 'transparent',
			},
			headerLeft: () => (
				<View>
					<Button variant="muted" icon={Icons.ChevronLeft} size="icon" style={{ borderRadius: BORDER_RADIUS_FULL }} onPress={() => router.canGoBack() ? router.back() : router.replace({ pathname: '/(tabs)/(home)'})} />
				</View>
			),
		}}
		/> */}
		<MapView
		ref={mapRef}
		style={{ flex: 1 }}
		mapStyle={styleJSON}
		attributionEnabled={false}
		onRegionDidChange={async () => {
			handleSaveCameraPosition();

			if (!mapRef.current || !selectedMovie) return;

			try {
				const bounds = await mapRef.current.getVisibleBounds();
				if (!bounds || bounds.length !== 2) return;

				const [sw, ne] = bounds;
				const [lng, lat] = selectedMovie.geometry.coordinates;

				const minLng = Math.min(sw[0], ne[0]);
				const maxLng = Math.max(sw[0], ne[0]);
				const minLat = Math.min(sw[1], ne[1]);
				const maxLat = Math.max(sw[1], ne[1]);

				const isVisible =
				lng >= minLng && lng <= maxLng &&
				lat >= minLat && lat <= maxLat;

				setShowRecenter(!isVisible);

			} catch (error) {
				console.error('Error getting visible bounds:', error);
			}
		}}
		>
			<Camera
			ref={cameraRef}
			defaultSettings={{
				centerCoordinate: map.center,
				zoomLevel: map.zoom,
			}}
			maxZoomLevel={12}
			minZoomLevel={7}
			maxBounds={{
				sw: [0.5, 47],
				ne: [4.5, 50],
			}}
			/>
			{genres && tile && (
				<ShapeSource
				id="explore-points"
				shape={tile}
				// onPress={handleOnLocationPress}
				>
					<SymbolLayer
					id="movies"
					filter={[
						'all',
						...(filters.releaseDate.min
							? [['>=', ['slice', ['get', 'release_date', ['get', 'movie']], 0, 4], String(filters.releaseDate.min)]]
							: []),
						...(filters.releaseDate.max
							? [['<=', ['slice', ['get', 'release_date', ['get', 'movie']], 0, 4], String(filters.releaseDate.max)]]
							: []),
						...(filters.runtime.min
							? [['>=', ['get', 'runtime', ['get', 'movie']], filters.runtime.min]]
							: []),
						...(filters.runtime.max
							? [['<=', ['get', 'runtime', ['get', 'movie']], filters.runtime.max]]
							: []),
						...(filters.genres.selected.length > 0
							? [
								filters.genres.match === 'all'
								? [
									'all',
									...filters.genres.selected.map((genreId) => [
										'in',
										genreId,
										['get', 'genres_ids', ['get', 'movie']],
									]),
									]
								: [
									'any',
									...filters.genres.selected.map((genreId) => [
										'in',
										genreId,
										['get', 'genres_ids', ['get', 'movie']],
									]),
									],
							]
							: []),
						...(selectedMovie
							? [['!=', ['get', 'id', ['get', 'movie']], selectedMovie.properties.movie.id]]
							: []),
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
							'coalesce',
							['image', ['concat', 'genres/', ['to-string', ['get', 'id', ['at', 0, ['get', 'genres', ['get', 'movie']]]]]]],
							'genres/default'
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
			{/* <MarkerView
			coordinate={[selectedMovie?.geometry.coordinates[0] || userPosition.longitude, selectedMovie?.geometry.coordinates[1] || userPosition.latitude]}
			anchor={{ x: 0.5, y: 1 }}
			style={{ opacity: selectedMovie ? 1 : 0 }}
			pointerEvents="none"
			>
				<View style={{ alignItems: 'center', justifyContent: 'center' }}>
					<View style={{ backgroundColor: colors.muted, padding: PADDING_VERTICAL, borderRadius: BORDER_RADIUS, opacity: 0.9 }}>
						<Text>{selectedMovie?.properties.movie.title}</Text>
					</View>
					<Icons.MapPin color={'rgba(136, 0, 0, 1)'} fill={'rgba(255, 0, 0, 1)'} size={32} />
				</View>
			</MarkerView> */}
		</MapView>

		{/* <TrueSheet
		ref={searchRef}
		detents={['auto', 0.8]}
		initialDetentIndex={0}
		dimmed={false}
		dismissible={false}
		header={
			<View>
				<Input placeholder="Search..." />
			</View>
		}
		>
			<View>
				<Text>Test Sheet Content</Text>
			</View>
		</TrueSheet> */}

		{/* <SearchBottomSheet
		ref={searchRef}
		index={animatedPOIListIndex}
		position={animatedPOIListPosition}
		onItemPress={handleOnSearchItemPress}
		/>
		<LocationDetailsBottomSheet
        ref={locationDetailsRef}
        index={animatedPOIDetailsIndex}
        position={animatedPOIDetailsPosition}
		onClose={handleOnLocationClose}
      	/> */}

		<Animated.View onLayout={(e) => optionsHeight.value = e.nativeEvent.layout.height} style={[{ position: 'absolute', bottom: insets.bottom + PADDING_VERTICAL, right: PADDING_HORIZONTAL, gap: GAP }, animatedOptionsStyle]}>
			{showRecenter && (
				<Button
				icon={Icons.Navigation}
				size="icon"
				variant="muted"
				onPress={() => {
					if (selectedMovie) {
						cameraRef.current?.moveTo(selectedMovie.geometry.coordinates, MOVE_DELAY);
					}
				}}
				/>
			)}
			<FiltersBottomSheet
			index={animatedFiltersIndex}
			position={animatedFiltersPosition}
			/>
		</Animated.View>
	</>
	);
};

export default withModalProvider(ExploreScreen);