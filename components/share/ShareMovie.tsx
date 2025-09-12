import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { View } from "../ui/view";
import { MediaMovie, MediaMovieBackdrop, MediaMoviePoster } from "@recomendapp/types";
import tw from "@/lib/tw";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import ViewShot from "react-native-view-shot";
import { Text } from "../ui/text";
import { Icons } from "@/constants/Icons";
import { Button } from "../ui/Button";
import { BORDER_RADIUS, GAP, HEIGHT, PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL, SOCIAL_CARD_WIDTH } from "@/theme/globals";
import WheelSelector from "../ui/WheelSelector";
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutRight } from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaMovieBackdropInfiniteQuery, useMediaMoviePosterInfiniteQuery } from "@/features/media/mediaQueries";
import { Image } from "expo-image";
import { CaptureResult, ShareViewRef } from "./type";
import { useAuth } from "@/providers/AuthProvider";
import { CircleIcon, LucideIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cropImageRatio } from "@/utils/imageManipulator";
import { ColorPair, useImageColorPairs } from "@/hooks/useImageColorPairs";
import { useRouter } from "expo-router";
import { ScaledCapture } from "../ui/ScaledCapture";
import app from "@/constants/app";
import { useWindowDimensions } from "react-native";
import { clamp } from "lodash";
import { TColors } from "@/constants/Colors";

interface ShareMovieProps extends React.ComponentProps<typeof ViewShot> {
	movie: MediaMovie;
	variant?: 'default';
};


const ITEM_WIDTH = 64;
const ITEM_SPACING = 8;


const EditOptionsSelector = ({
	editOptions,
	activeEditingOption,
	setActiveEditingOption
}: {
	editOptions: Array<{value: string, icon: LucideIcon}>;
	activeEditingOption: string;
	setActiveEditingOption: (value: string) => void;
}) => {
	const editButtonStyle = useMemo(() => [tw`rounded-full`, { width: HEIGHT, height: HEIGHT }], []);
	const wheelStyle = useMemo(() => ({ marginVertical: PADDING_VERTICAL }), []);

	const renderEditItem = useCallback((item: {value: string, icon: LucideIcon}, isActive: boolean) => (
		<Button
		variant={isActive ? "accent-yellow" : "outline"}
		icon={item.icon}
		size="icon"
		style={editButtonStyle}
		/>
	), [editButtonStyle]);

	const handleSelectionChange = useCallback((item: {value: string, icon: LucideIcon}) => {
		setActiveEditingOption(item.value);
	}, [setActiveEditingOption]);
	
	const initialIndex = useMemo(() => 
		editOptions.findIndex(e => e.value === activeEditingOption),
		[editOptions, activeEditingOption]);

	const keyExtractor = useCallback((item: {value: string, icon: LucideIcon}) => item.value, []);

	return (
		<WheelSelector
		id={`edit-options-selector`}
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
		style={wheelStyle}
		/>
	);
};


/* -------------------------------- VARIANTS -------------------------------- */
const ShareMovieDefault = ({ movie, poster, scale = 1 } : { movie: MediaMovie, poster: string | undefined, scale?: number }) => {
	const { colors } = useTheme();
	
	const containerStyle = useMemo(() => [{
		borderRadius: BORDER_RADIUS * scale,
		backgroundColor: colors.muted,
		gap: GAP * scale,
		padding: PADDING / 2 * scale
	}], [colors.muted, scale]);
	
	const imageStyle = useMemo(() => [{
		aspectRatio: 2 / 3,
		borderRadius: BORDER_RADIUS * scale
	}, tw`w-full h-auto`], [scale]);
	
	const titleStyle = useMemo(() => [tw`font-bold`, { fontSize: 16 * scale }], [scale]);
	const directorStyle = useMemo(() => ({ fontSize: 12 * scale }), [scale]);
	
	const directorsText = useMemo(() => 
		movie.directors?.map(d => d.name!).join(', '), [movie.directors]);
	
	return (
		<View style={containerStyle}>
			<ImageWithFallback
			source={{uri: poster ?? '' }}
			alt={movie.title ?? ''}
			type={'movie'}
			style={imageStyle}
			/>
			<View>
			<Text style={titleStyle}>{movie.title}</Text>
			{directorsText && <Text textColor="muted" style={directorStyle}>{directorsText}</Text>}
			</View>
			<Icons.site.logo color={colors.accentYellow} height={10 * scale}/>
		</View>
	)
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- CUSTOM --------------------------------- */
const ShareMovieCustomPoster = ({
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
		id={`poster-selector`}
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
	poster,
	bgColor,
	setBgColor,
	colors
}: {
	poster: string | undefined;
	bgColor: { index: number, colors: ColorPair } | null;
	setBgColor: (color: { index: number, colors: ColorPair } | null) => void;
	colors: TColors;
}) => {
	const { colorPairs } = useImageColorPairs(poster);
	const colorItemStyle = useMemo(() => [{
		borderColor: colors.border,
		width: ITEM_WIDTH,
		height: ITEM_WIDTH
	}, tw`border-2 rounded-full overflow-hidden`], [colors.border]);
	
	const renderColorItem = useCallback((item: ColorPair, isActive: boolean) => (
		<Animated.View style={colorItemStyle}>
			<LinearGradient style={tw`absolute inset-0`} colors={[item.top, item.bottom]}/>
		</Animated.View>
	), [colorItemStyle]);
	
	const handleColorSelection = useCallback((item: ColorPair, index: number) => {
		setBgColor({ index, colors: item });
	}, [setBgColor]);

	const keyExtractor = useCallback((item: ColorPair, index: number) => index.toString(), []);
	
	return (
		<WheelSelector
		entering={FadeInDown}
		exiting={FadeOutDown}
		data={colorPairs}
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
	backdrops,
	selectedBackdrop,
	setBackdrop,
	movieTitle,
	hasNextPage,
	fetchNextPage
}: {
	backdrops: MediaMovieBackdrop[];
	selectedBackdrop?: string;
	setBackdrop: (backdrop: string) => void;
	movieTitle: string;
	hasNextPage: boolean;
	fetchNextPage: () => void;
}) => {
	const imageStyle = useMemo(() => [{ aspectRatio: 2 / 3, width: ITEM_WIDTH }], []);
	
	const renderBackdropItem = useCallback((item: MediaMovieBackdrop, isActive: boolean) => (
		<ImageWithFallback
			source={{ uri: item.backdrop_url ?? '' }}
			alt={movieTitle}
			type="movie"
			style={imageStyle}
		/>
	), [movieTitle, imageStyle]);
	
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

const ShareMovieCustomBackdrop = ({
	movie,
	poster,
	backdrop,
	setBackdrop,
	bgType,
	bgColor,
	setBgColor,
} : {
	movie: MediaMovie;
	poster?: string;
	backdrop?: string;
	setBackdrop: (backdrop: string) => void;
	bgType: 'color' | 'image';
	bgColor: { index: number, colors: ColorPair } | null;
	setBgColor: (color: { index: number, colors: ColorPair } | null) => void;
}) => {
	const { colors } = useTheme();
	const {
		data,
		hasNextPage,
		fetchNextPage,
	} = useMediaMovieBackdropInfiniteQuery({
		movieId: bgType === 'image' ? movie.id : undefined,
	});

	const backdrops = useMemo(() => data?.pages.flat() ?? [], [data]);

	return (
		<View style={tw`absolute bottom-0`}>
			{bgType === 'image' ? (
				<BackdropImageSelector
				backdrops={backdrops}
				selectedBackdrop={backdrop}
				setBackdrop={setBackdrop}
				movieTitle={movie.title ?? ''}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
				/>
			) : (
				<ColorSelector
				poster={poster}
				bgColor={bgColor}
				setBgColor={setBgColor}
				colors={colors}
				/>
			)}
		</View>
	);
};
/* -------------------------------------------------------------------------- */

export const ShareMovie = forwardRef<
	ShareViewRef,
	ShareMovieProps
>(({ movie, variant = 'default', ...props }, ref) => {
	const { session, customerInfo } = useAuth();
	const router = useRouter();
	const viewShotRef = useRef<ViewShot>(null);
	const { height: screenHeight } = useWindowDimensions();

	// States
	const [poster, setPoster] = useState<string | undefined>(movie.poster_url ?? undefined);
	const [backdrop, setBackdrop] = useState<string | undefined>(movie.backdrop_url ?? undefined);
	const [bgType, setBgType] = useState<'color' | 'image'>(backdrop ? 'image' : 'color');
	const [bgColor, setBgColor] = useState<{index: number, colors: ColorPair } | null>(null);
	const [editing, setEditing] = useState(false);
	const editOptions = useMemo(() => [
		...(poster ? [{ value: 'poster', icon: Icons.Image }] : []),
		{ value: 'background', icon: Icons.Wallpaper }
	], [poster]);
	const [activeEditingOption, setActiveEditingOption] = useState(editOptions[0].value);

	// Renders
	const renderSticker = useCallback((scale: number) => {
		switch (variant) {
			default:
				return <ShareMovieDefault movie={movie} poster={poster} scale={scale} />;
		}
	}, [movie, poster, backdrop]);
	const EditingSelector = useMemo(() => {
		if (!editing) return null;
		return (
			<EditOptionsSelector
			editOptions={editOptions}
			activeEditingOption={activeEditingOption}
			setActiveEditingOption={setActiveEditingOption}
			/>
		);
	}, [editing, activeEditingOption, setActiveEditingOption]);

	const EditingOptions = useMemo(() => {
		if (!editing) return null;
		switch (activeEditingOption) {
			case 'poster':
				return (
					<ShareMovieCustomPoster
					movie={movie}
					poster={poster}
					setPoster={setPoster}
					/>
				);
			case 'background':
				return (
					<ShareMovieCustomBackdrop
					movie={movie}
					poster={poster}
					backdrop={backdrop}
					setBackdrop={setBackdrop}
					bgType={bgType}
					bgColor={bgColor}
					setBgColor={setBgColor}
					/>
				);
			default:
				return null;
		}
	}, [editing, activeEditingOption, movie, bgType]);
	const EditingButtons = useMemo(() => (
		<View style={tw`absolute top-2 right-2 flex-row items-center gap-2`}>
			{editing && backdrop && activeEditingOption === 'background' && (
				<Animated.View entering={FadeInRight} exiting={FadeOutRight}>
					<Button
					variant="muted"
					icon={bgType === 'color' ? CircleIcon : Icons.Image}
					size="icon"
					iconProps={bgType === 'color' && bgColor ? { fill: bgColor.colors.top } : undefined}
					onPress={() => setBgType((prev) => prev === 'color' ? 'image' : 'color')}
					style={tw`rounded-full`}
					/>
				</Animated.View>
			)}
			<Button
			variant="muted"
			icon={editing ? Icons.Check : Icons.Edit}
			size="icon"
			style={tw`rounded-full`}
			onPress={() => {
				if (!session) {
					router.push({
						pathname: '/auth',
					})
				} else if (!customerInfo?.entitlements.active['premium']) {
					router.push({
						pathname: '/upgrade',
						params: {
							feature: app.features.custom_share_image,
						}
					})
				} else {
					setEditing((prev) => !prev);
				}
			}}
			/>
		</View>
	), [editing, activeEditingOption, bgType, session, bgColor, backdrop]);

	// Refs
	useImperativeHandle(ref, () => ({
      	capture: async (options): Promise<CaptureResult> => {
			if (!viewShotRef.current) throw new Error('ViewShot ref is not available');	
			const uri = await viewShotRef.current.capture?.();
			const backgroundImage = (bgType === 'image' && backdrop) ? await cropImageRatio(backdrop, options?.background?.ratio ?? 9 / 16) : undefined;
			return {
				sticker: uri,
				backgroundImage: backgroundImage,
				...(bgType === 'color' && bgColor ? {
					backgroundTopColor: bgColor.colors.top,
					backgroundBottomColor: bgColor.colors.bottom
				} : {}),
			};
		}
	}));

	return (
		<View style={{ gap: GAP }} {...props}>
			<View style={tw`items-center`}>
				<View style={[{ aspectRatio: 9/16, paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, borderRadius: BORDER_RADIUS, height: clamp(400, screenHeight * 0.7) },tw`relative items-center justify-center overflow-hidden`]}>
					{bgType === 'image' && backdrop ? (
						<Image source={backdrop} style={tw`absolute inset-0`} />
					) : bgType === 'color' && bgColor && (
						<LinearGradient style={tw`absolute inset-0`} colors={[bgColor.colors.top, bgColor.colors.bottom]} />
					)}
					<ScaledCapture
					ref={viewShotRef}
					targetWidth={SOCIAL_CARD_WIDTH}
					renderContent={(scale) => renderSticker(scale)}
					/>
					{EditingButtons}
				</View>
				{EditingOptions}
			</View>
			{EditingSelector}
		</View>
	);
});
ShareMovie.displayName = 'ShareMovie';
