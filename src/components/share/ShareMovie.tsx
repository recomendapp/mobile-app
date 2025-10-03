import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { View } from "@/components/ui/view";
import { MediaMovie, MediaMovieBackdrop, MediaMoviePoster } from "@recomendapp/types";
import tw from "@/lib/tw";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import ViewShot from "react-native-view-shot";
import { Text } from "@/components/ui/text";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { BORDER_RADIUS, GAP, HEIGHT, PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL, SOCIAL_CARD_WIDTH } from "@/theme/globals";
import WheelSelector from "@/components/ui/WheelSelector";
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutRight } from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaMovieBackdropInfiniteQuery, useMediaMoviePosterInfiniteQuery } from "@/features/media/mediaQueries";
import { Image } from "expo-image";
import { CaptureResult, ShareViewRef } from "@/components/share/type";
import { useAuth } from "@/providers/AuthProvider";
import { CircleIcon, LucideIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cropImageRatio } from "@/utils/imageManipulator";
import { ColorPair, useImageColorPairs } from "@/hooks/useImageColorPairs";
import { router, useRouter } from "expo-router";
import { ScaledCapture } from "@/components/ui/ScaledCapture";
import app from "@/constants/app";
import { useWindowDimensions } from "react-native";
import { clamp } from "lodash";
import { TColors } from "@/constants/Colors";
import { useImagePalette } from "@/hooks/useImagePalette";
import Color from "color";

interface ShareMovieProps extends React.ComponentProps<typeof ViewShot> {
	movie: MediaMovie;
	variant?: 'default';
	isPremium?: boolean;
};

type EditType = 'poster' | 'background';

type EditOption = {
	value: EditType;
	icon: LucideIcon;
}

const ITEM_WIDTH = 64;
const ITEM_SPACING = 8;


const EditOptionsSelector = ({
	editOptions,
	activeEditingOption,
	setActiveEditingOption
}: {
	editOptions: EditOption[];
	activeEditingOption: EditType;
	setActiveEditingOption: (value: EditType) => void;
}) => {
	const renderEditItem = useCallback((item: EditOption, isActive: boolean) => {
		console.log('[WheelSelector] Item: ', item.value, 'isActive:', isActive);
		return (
			<Button
			variant={isActive ? "accent-yellow" : "outline"}
			icon={item.icon}
			size="icon"
			style={[
				tw`rounded-full`,
				{ width: HEIGHT, height: HEIGHT }
			]}
			/>
		)
	}, []);

	const handleSelectionChange = useCallback((item: EditOption) => {
		setActiveEditingOption(item.value);
	}, [setActiveEditingOption]);
	
	const initialIndex = useMemo(() => 
		editOptions.findIndex(e => e.value === activeEditingOption),
		[editOptions, activeEditingOption]
	);

	const keyExtractor = useCallback((item: EditOption) => item.value, []);

	return (
		<WheelSelector
		data={editOptions}
		extraData={activeEditingOption}
		entering={FadeInDown}
		exiting={FadeOutDown}
		renderItem={renderEditItem}
		keyExtractor={keyExtractor}
		onSelectionChange={handleSelectionChange}
		initialIndex={initialIndex}
		enableHaptics={true}
		itemWidth={HEIGHT}
		style={{
			marginVertical: PADDING_VERTICAL,
		}}
		/>
	);
};


/* -------------------------------- VARIANTS -------------------------------- */
const ShareMovieDefault = ({ movie, poster, scale = 1 } : { movie: MediaMovie, poster: string | undefined, scale?: number }) => {
	const { colors } = useTheme();
	const directorsText = useMemo(() => movie.directors?.map(d => d.name!).join(', '), [movie.directors]);
	return (
		<View
		style={{
			borderRadius: BORDER_RADIUS * scale,
			backgroundColor: Color(colors.muted).alpha(0.9).string(),
			gap: GAP * scale,
			padding: PADDING / 2 * scale
		}}
		>
			<ImageWithFallback
			source={{uri: poster ?? '' }}
			alt={movie.title ?? ''}
			type={'movie'}
			style={[
				{
					aspectRatio: 2 / 3,
					borderRadius: BORDER_RADIUS * scale
				},
				tw`w-full h-auto`
			]}
			/>
			<View>
			<Text style={[tw`font-bold`, { fontSize: 16 * scale }]}>{movie.title}</Text>
			{directorsText && <Text textColor="muted" style={{ fontSize: 12 * scale }}>{directorsText}</Text>}
			</View>
			<Icons.app.logo color={colors.accentYellow} height={10 * scale}/>
		</View>
	)
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- CUSTOM --------------------------------- */
const PosterSelector = ({
	movie,
	poster,
	setPoster,
} : {
	movie: MediaMovie;
	poster: string | undefined;
	setPoster: (poster: string) => void;
}) => {
	const {
		data,
		hasNextPage,
		fetchNextPage,
	} = useMediaMoviePosterInfiniteQuery({
		movieId: poster ? movie.id : undefined,
	});
	const posters = useMemo(() => data?.pages.flat() || [], [data]);
	const initialIndex = useMemo(() => posters.findIndex(p => p.poster_url === poster), [posters]);
	const renderItem = useCallback((item: MediaMoviePoster, isActive: boolean) => (
		<ImageWithFallback
		source={{ uri: item.poster_url ?? '' }}
		alt={movie.title ?? ''}
		type={"movie"}
		style={[{ aspectRatio: 2 / 3, width: ITEM_WIDTH }]}
		/>
	), [movie.title]);
	const keyExtractor = useCallback((item: MediaMoviePoster) => item.id!.toString(), []);
	const onSelectionChange = useCallback((item: MediaMoviePoster) => {
		setPoster(item.poster_url!);
	}, [setPoster]);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);
	return (
		<WheelSelector
		entering={FadeInDown}
		exiting={FadeOutDown}
		data={posters}
		renderItem={renderItem}
		keyExtractor={keyExtractor}
		onSelectionChange={onSelectionChange}
		initialIndex={initialIndex}
		enableHaptics={true}
		itemWidth={ITEM_WIDTH}
		itemSpacing={ITEM_SPACING}
		wheelAngle={0}
		wheelIntensity={0.2}
		containerStyle={tw`absolute bottom-0`}
		onEndReached={onEndReached}
		/>
	);
};
const ColorSelector = ({
	colors,
	bgColor,
	setBgColor,
}: {
	colors: string[];
	bgColor: { index: number, color: string } | null;
	setBgColor: (color: { index: number, color: string } | null) => void;
}) => {
	const { colors: colorsTheme } = useTheme();

	const renderColorItem = useCallback((item: string, isActive: boolean) => (
		<View
		style={[
			{
				backgroundColor: item,
				borderColor: colorsTheme.border,
				width: ITEM_WIDTH,
				height: ITEM_WIDTH,
			},
			tw`border-2 rounded-full overflow-hidden`,
		]}
		/>
	), [colorsTheme.border]);
	
	const handleColorSelection = useCallback((item: string, index: number) => {
		setBgColor({ index, color: item });
	}, [setBgColor]);

	const keyExtractor = useCallback((item: string, index: number) => index.toString(), []);
	return (
		<WheelSelector
		entering={FadeInDown}
		exiting={FadeOutDown}
		data={colors}
		renderItem={renderColorItem}
		keyExtractor={keyExtractor}
		onSelectionChange={handleColorSelection}
		initialIndex={bgColor?.index ?? 0}
		enableHaptics={true}
		itemWidth={ITEM_WIDTH}
		itemSpacing={ITEM_SPACING}
		wheelAngle={0}
		wheelIntensity={0.2}
		/>
	);
};
const BackdropImageSelector = ({
	movieId,
	selectedBackdrop,
	setBackdrop,
	movieTitle,
}: {
	movieId: number;
	selectedBackdrop?: string;
	setBackdrop: (backdrop: string) => void;
	movieTitle: string;
}) => {
	const {
		data,
		hasNextPage,
		fetchNextPage,
	} = useMediaMovieBackdropInfiniteQuery({
		movieId: movieId,
	});
	const backdrops = useMemo(() => data?.pages.flat() || [], [data]);
	
	const renderBackdropItem = useCallback((item: MediaMovieBackdrop, isActive: boolean) => (
		<ImageWithFallback
			source={{ uri: item.backdrop_url ?? '' }}
			alt={movieTitle}
			type="movie"
			style={{ aspectRatio: 2 / 3, width: ITEM_WIDTH }}
		/>
	), [movieTitle]);

	const handleBackdropSelection = useCallback((item: MediaMovieBackdrop) => {
		setBackdrop(item.backdrop_url!);
	}, [setBackdrop]);
	
	const handleEndReached = useCallback(() => {
		if (hasNextPage) fetchNextPage();
	}, [hasNextPage, fetchNextPage]);
	
	const initialIndex = useMemo(() => 
		backdrops.findIndex(p => p.backdrop_url === selectedBackdrop) ?? 0,
		[backdrops, selectedBackdrop]);
	
	const keyExtractor = useCallback((item: MediaMovieBackdrop) => item.id!.toString(), []);
	
	return (
		<WheelSelector
		entering={FadeInDown}
		exiting={FadeOutDown}
		data={backdrops}
		renderItem={renderBackdropItem}
		keyExtractor={keyExtractor}
		onSelectionChange={handleBackdropSelection}
		initialIndex={initialIndex}
		enableHaptics={true}
		itemWidth={ITEM_WIDTH}
		itemSpacing={ITEM_SPACING}
		wheelAngle={0}
		wheelIntensity={0.2}
		onEndReached={handleEndReached}
		/>
	);
};

/* -------------------------------------------------------------------------- */

export const ShareMovie = forwardRef<
	ShareViewRef,
	ShareMovieProps
>(({ movie, variant = 'default', isPremium, ...props }, ref) => {
	const viewShotRef = useRef<ViewShot>(null);
	const { height: screenHeight } = useWindowDimensions();
	const { colors } = useTheme();
	console.log('isPremium:', isPremium);
	// States
	const [poster, setPoster] = useState(movie.poster_url || undefined);
	const [backdrop, setBackdrop] = useState(movie.backdrop_url || undefined);
	const { palette } = useImagePalette(poster);
	const [bgColor, setBgColor] = useState<{index: number, color: string } | null>(palette ? { index: 0, color: palette[0] } : null);
	const [bgType, setBgType] = useState<'color' | 'image'>(isPremium && backdrop ? 'image' : 'color');
	const [editing, setEditing] = useState(false);
	const editOptions = useMemo((): EditOption[] => {
		if (!isPremium || !poster) return [{ value: 'background', icon: Icons.Wallpaper }];
		return [
		{ value: 'poster', icon: Icons.Image },
		{ value: 'background', icon: Icons.Wallpaper }
		];
	}, [poster, isPremium]);
	const [activeEditingOption, setActiveEditingOption] = useState(editOptions[0].value);

	useImperativeHandle(ref, () => ({
      	capture: async (options): Promise<CaptureResult> => {
			if (!viewShotRef.current) throw new Error('ViewShot ref is not available');	
			const uri = await viewShotRef.current.capture?.();

			const backgroundImage = (isPremium && bgType === 'image' && backdrop)
				? await cropImageRatio(backdrop, options?.background?.ratio ?? 9 / 16)
				: undefined;

			return {
				sticker: uri,
				backgroundImage: backgroundImage?.uri,
				...(bgType === 'color' && bgColor ? {
					backgroundTopColor: bgColor.color,
					backgroundBottomColor: bgColor.color,
				} : {}),
			};
		}
	}));

	const renderSticker = useCallback((scale: number) => (
		<ShareMovieDefault movie={movie} poster={poster} scale={scale} />
	), [movie, poster]);

	const renderEditSelector = useMemo(() => {
		if (!editing || !isPremium) return null;
		return (
			<EditOptionsSelector
			editOptions={editOptions}
			activeEditingOption={activeEditingOption}
			setActiveEditingOption={setActiveEditingOption}
			/>
		);
	}, [editing, activeEditingOption, setActiveEditingOption, editOptions, isPremium]);
	
	const renderEditButtons = useMemo(() => (
		<View style={[tw`absolute top-2 right-2 flex-row items-center`, { gap: GAP }]}>
			{editing && (
				<Animated.View entering={FadeInRight} exiting={FadeOutRight} style={[tw`flex-row items-center`, { gap: GAP }]}>
				{!isPremium && (
					<Button variant='accent-yellow' icon={Icons.Password} size='icon' onPress={() => router.push('/upgrade')} style={tw`rounded-full`} />
				)}
				{backdrop && activeEditingOption === 'background' && isPremium && (
					<Button
					variant="muted"
					icon={bgType === 'image' && bgColor ? CircleIcon : Icons.Image}
					size="icon"
					iconProps={bgType === 'image' && bgColor ? { fill: bgColor.color } : undefined}
					onPress={() => setBgType((prev) => prev === 'color' ? 'image' : 'color')}
					style={tw`rounded-full`}
					/>
				)}
				</Animated.View>
			)}
			<Button
			variant="muted"
			icon={editing ? Icons.Check : Icons.Edit}
			size="icon"
			style={tw`rounded-full`}
			onPress={() => setEditing((prev) => !prev)}
			/>
		</View>
	), [editing, backdrop, activeEditingOption, isPremium, bgType, bgColor]);
	
	const renderEditOptions = useMemo(() => {
		if (!editing) return null;
		switch (activeEditingOption) {
			case 'poster':
				return (
					<PosterSelector
					movie={movie}
					poster={poster}
					setPoster={setPoster}
					/>
				);
			case 'background':
				return (
				<View style={tw`absolute bottom-0`}>
					{bgType === 'image' ? (
						<BackdropImageSelector
						movieId={movie.id}
						selectedBackdrop={backdrop}
						setBackdrop={setBackdrop}
						movieTitle={movie.title ?? ''}
						/>
					) : (
						palette && (
							<ColorSelector
							bgColor={bgColor}
							setBgColor={setBgColor}
							colors={palette}
							/>
						)
					)}
				</View>
				);
			default:
				return null;
		}
	}, [editing, activeEditingOption, movie, bgType, bgColor]);

	// useEffects
	useEffect(() => {
		if (palette) {
			setBgColor({ index: 0, color: palette[0] });
		} else {
			setBgColor(null);
		};
	}, [palette]);

	return (
		<View style={{ gap: GAP }} {...props}>
			<View style={tw`items-center`}>
				<View
					style={[
						{ aspectRatio: 9/16, paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, borderRadius: BORDER_RADIUS, height: clamp(400, screenHeight * 0.7), backgroundColor: colors.background },
						tw`relative items-center justify-center overflow-hidden`
					]}
				>
					{isPremium && bgType === 'image' && backdrop ? (
						<Image source={backdrop} style={tw`absolute inset-0`} />
					) : bgType === 'color' && bgColor && (
						<View style={[tw`absolute inset-0`, { backgroundColor: bgColor.color }]} />
					)}
					
					<ScaledCapture
						ref={viewShotRef}
						targetWidth={SOCIAL_CARD_WIDTH}
						renderContent={(scale) => renderSticker(scale)}
					/>
					{renderEditButtons}
				</View>
				{renderEditOptions}
			</View>
			{renderEditSelector}
		</View>
	);
});

// export const ShareMovie = forwardRef<
// 	ShareViewRef,
// 	ShareMovieProps
// >(({ movie, variant = 'default', ...props }, ref) => {
// 	const { session, customerInfo } = useAuth();
// 	const router = useRouter();
// 	const viewShotRef = useRef<ViewShot>(null);
// 	const { height: screenHeight } = useWindowDimensions();

// 	// States
// 	const [poster, setPoster] = useState<string | undefined>(movie.poster_url ?? undefined);
// 	const [backdrop, setBackdrop] = useState<string | undefined>(movie.backdrop_url ?? undefined);
// 	const [bgType, setBgType] = useState<'color' | 'image'>(backdrop ? 'image' : 'color');
// 	const [bgColor, setBgColor] = useState<{index: number, colors: ColorPair } | null>(null);
// 	const [editing, setEditing] = useState(false);
// 	const editOptions = useMemo(() => [
// 		...(poster ? [{ value: 'poster', icon: Icons.Image }] : []),
// 		{ value: 'background', icon: Icons.Wallpaper }
// 	], [poster]);
// 	const [activeEditingOption, setActiveEditingOption] = useState(editOptions[0].value);

// 	// Renders
// 	const renderSticker = useCallback((scale: number) => {
// 		switch (variant) {
// 			default:
// 				return <ShareMovieDefault movie={movie} poster={poster} scale={scale} />;
// 		}
// 	}, [movie, poster, backdrop]);
// 	const EditingSelector = useMemo(() => {
// 		if (!editing) return null;
// 		return (
// 			<EditOptionsSelector
// 			editOptions={editOptions}
// 			activeEditingOption={activeEditingOption}
// 			setActiveEditingOption={setActiveEditingOption}
// 			/>
// 		);
// 	}, [editing, activeEditingOption, setActiveEditingOption]);

// 	const EditingOptions = useMemo(() => {
// 		if (!editing) return null;
// 		switch (activeEditingOption) {
// 			case 'poster':
// 				return (
// 					<ShareMovieCustomPoster
// 					movie={movie}
// 					poster={poster}
// 					setPoster={setPoster}
// 					/>
// 				);
// 			case 'background':
// 				return (
// 					<ShareMovieCustomBackdrop
// 					movie={movie}
// 					poster={poster}
// 					backdrop={backdrop}
// 					setBackdrop={setBackdrop}
// 					bgType={bgType}
// 					bgColor={bgColor}
// 					setBgColor={setBgColor}
// 					/>
// 				);
// 			default:
// 				return null;
// 		}
// 	}, [editing, activeEditingOption, movie, bgType]);
// 	const EditingButtons = useMemo(() => (
// 		<View style={tw`absolute top-2 right-2 flex-row items-center gap-2`}>
// 			{editing && backdrop && activeEditingOption === 'background' && (
// 				<Animated.View entering={FadeInRight} exiting={FadeOutRight}>
// 					<Button
// 					variant="muted"
// 					icon={bgType === 'color' ? CircleIcon : Icons.Image}
// 					size="icon"
// 					iconProps={bgType === 'color' && bgColor ? { fill: bgColor.colors.top } : undefined}
// 					onPress={() => setBgType((prev) => prev === 'color' ? 'image' : 'color')}
// 					style={tw`rounded-full`}
// 					/>
// 				</Animated.View>
// 			)}
// 			<Button
// 			variant="muted"
// 			icon={editing ? Icons.Check : Icons.Edit}
// 			size="icon"
// 			style={tw`rounded-full`}
// 			onPress={() => {
// 				if (!session) {
// 					router.push({
// 						pathname: '/auth',
// 					})
// 				} else if (!customerInfo?.entitlements.active['premium']) {
// 					router.push({
// 						pathname: '/upgrade',
// 						params: {
// 							feature: app.features.custom_share_image,
// 						}
// 					})
// 				} else {
// 					setEditing((prev) => !prev);
// 				}
// 			}}
// 			/>
// 		</View>
// 	), [editing, activeEditingOption, bgType, session, bgColor, backdrop]);

// 	// Refs
// 	useImperativeHandle(ref, () => ({
//       	capture: async (options): Promise<CaptureResult> => {
// 			if (!viewShotRef.current) throw new Error('ViewShot ref is not available');	
// 			const uri = await viewShotRef.current.capture?.();
// 			const backgroundImage = (bgType === 'image' && backdrop) ? await cropImageRatio(backdrop, options?.background?.ratio ?? 9 / 16) : undefined;
// 			return {
// 				sticker: uri,
// 				backgroundImage: backgroundImage?.uri,
// 				...(bgType === 'color' && bgColor ? {
// 					backgroundTopColor: bgColor.colors.top,
// 					backgroundBottomColor: bgColor.colors.bottom
// 				} : {}),
// 			};
// 		}
// 	}));

// 	return (
// 		<View style={{ gap: GAP }} {...props}>
// 			<View style={tw`items-center`}>
// 				<View style={[{ aspectRatio: 9/16, paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, borderRadius: BORDER_RADIUS, height: clamp(400, screenHeight * 0.7) },tw`relative items-center justify-center overflow-hidden`]}>
// 					{bgType === 'image' && backdrop ? (
// 						<Image source={backdrop} style={tw`absolute inset-0`} />
// 					) : bgType === 'color' && bgColor && (
// 						<LinearGradient style={tw`absolute inset-0`} colors={[bgColor.colors.top, bgColor.colors.bottom]} />
// 					)}
// 					<ScaledCapture
// 					ref={viewShotRef}
// 					targetWidth={SOCIAL_CARD_WIDTH}
// 					renderContent={(scale) => renderSticker(scale)}
// 					/>
// 					{EditingButtons}
// 				</View>
// 				{EditingOptions}
// 			</View>
// 			{EditingSelector}
// 		</View>
// 	);
// });
// ShareMovie.displayName = 'ShareMovie';
