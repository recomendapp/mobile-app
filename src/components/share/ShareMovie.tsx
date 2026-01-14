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
import { Image } from "expo-image";
import { CaptureResult, ShareViewRef } from "@/components/share/type";
import { CircleIcon, LucideIcon } from "lucide-react-native";
import { cropImageRatio } from "@/utils/imageManipulator";
import { router } from "expo-router";
import { ScaledCapture } from "@/components/ui/ScaledCapture";
import { useWindowDimensions } from "react-native";
import { clamp } from "lodash";
import { useImagePalette } from "@/hooks/useImagePalette";
import Color from "color";
import { ShapeVerticalRoundedBackground, ShapeVerticalRoundedForeground } from "@/lib/icons";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useMediaMovieBackdropsQuery, useMediaMoviePostersQuery } from "@/api/medias/mediaQueries";
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
	const { colors } = useTheme();
	const renderEditItem = useCallback((item: EditOption, isActive: boolean) => {
		return (
		<View
		style={[
			tw`rounded-full items-center justify-center w-full aspect-square border`,
			{
				backgroundColor: colors.muted,
				borderColor: isActive ? colors.foreground : colors.border,
			}
		]}
		>
			<item.icon size={20} color={colors.foreground} />
		</View>
		);
	}, [colors.border, colors.foreground, colors.muted]);

	const handleSelectionChange = useCallback((item: EditOption) => {
		setActiveEditingOption(item.value);
	}, [setActiveEditingOption]);

	const initialIndex = useMemo(() => {
		const isFind = editOptions.findIndex(e => e.value === activeEditingOption);
		return isFind === -1 ? 0 : isFind;
	}, [editOptions, activeEditingOption]);

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
			backgroundColor: Color(colors.muted).alpha(0.95).string(),
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
	} = useMediaMoviePostersQuery({
		movieId: poster ? movie.id : undefined,
	});
	const posters = useMemo(() => data?.pages.flat() || [], [data]);
	const initialIndex = useMemo(() => {
		const isFind = posters.findIndex(p => p.poster_url === poster);
		return isFind === -1 ? 0 : isFind;
	}, [posters, poster]);
	const renderItem = useCallback((item: MediaMoviePoster, isActive: boolean) => (
		<ImageWithFallback
		source={{ uri: getTmdbImage({ path: item.file_path, size: 'w154' }) ?? '' }}
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
			},
			tw`w-full aspect-square rounded-full overflow-hidden border-2`,
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
	} = useMediaMovieBackdropsQuery({
		movieId: movieId,
	});
	const backdrops = useMemo(() => data?.pages.flat() || [], [data]);
	
	const renderBackdropItem = useCallback((item: MediaMovieBackdrop, isActive: boolean) => (
		<ImageWithFallback
			source={{ uri: getTmdbImage({ path: item.file_path, size: 'w154' }) ?? '' }}
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
	
	const initialIndex = useMemo(() => {
		const isFind = backdrops.findIndex(p => p.backdrop_url === selectedBackdrop);
		return isFind === -1 ? 0 : isFind;
	}, [backdrops, selectedBackdrop]);

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
	// States
	const [poster, setPoster] = useState(movie.poster_url || undefined);
	const [backdrop, setBackdrop] = useState(movie.backdrop_url || undefined);
	const { palette } = useImagePalette(poster);
	const [bgColor, setBgColor] = useState<{index: number, color: string } | null>(palette ? { index: 0, color: palette[0] } : null);
	const [bgType, setBgType] = useState<'color' | 'image'>(isPremium && backdrop ? 'image' : 'color');
	const [editing, setEditing] = useState(false);
	const editOptions = useMemo((): EditOption[] => {
		const options: EditOption[] = [];
		const hasPoster = !!poster;
		const hasBackground = !!poster || !!backdrop;
		if (hasPoster) {
			options.push({ value: 'poster', icon: ShapeVerticalRoundedForeground });
		}
		if (hasBackground) {
			options.push({ value: 'background', icon: ShapeVerticalRoundedBackground });
		}
		return options;
	}, [poster, backdrop]);
	const [activeEditingOption, setActiveEditingOption] = useState(editOptions[0].value);

	useImperativeHandle(ref, () => ({
      	capture: async (options): Promise<CaptureResult> => {
			if (!viewShotRef.current) throw new Error('ViewShot ref is not available');	
			const uri = await viewShotRef.current.capture?.();

			const backgroundImage = (bgType === 'image' && backdrop)
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

	const handleEnableEditing = useCallback(() => {
		if (isPremium) {
			setEditing((v) => !v);
		} else {
			router.push('/upgrade');
		}
	}, [isPremium]);

	const EditSelectors = useMemo(() => {
		if (!editing) return null;
		return (
			<EditOptionsSelector
			editOptions={editOptions}
			activeEditingOption={activeEditingOption}
			setActiveEditingOption={setActiveEditingOption}
			/>
		);
	}, [editing, activeEditingOption, editOptions]);
	
	const EditButtons = useMemo(() => (
		<View style={[tw`absolute top-2 right-2 flex-row items-center`, { gap: GAP }]}>
			{editing && (
				<Animated.View entering={FadeInRight} exiting={FadeOutRight} style={[tw`flex-row items-center`, { gap: GAP }]}>
				{backdrop && activeEditingOption === 'background' && (
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
			onPress={handleEnableEditing}
			/>
		</View>
	), [editing, backdrop, activeEditingOption, handleEnableEditing, bgType, bgColor]);
	
	const EditOptions = useMemo(() => {
		if (!editing) return null;
		const content = (() => {
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
					if (bgType === 'color' && palette) {
						return (
							<ColorSelector
							colors={palette}
							bgColor={bgColor}
							setBgColor={setBgColor}
							/>
						);
					} else {
						return (
							<BackdropImageSelector
							movieId={movie.id}
							selectedBackdrop={backdrop}
							setBackdrop={setBackdrop}
							movieTitle={movie.title ?? ''}
							/>
						);
					}
				default:
					return null;
			}
		})();
		return (
			<View style={[tw`absolute w-full`, { bottom: PADDING_VERTICAL }]}>
				{content}
			</View>
		)
	}, [editing, activeEditingOption, bgType, palette, bgColor, movie, poster, backdrop]);

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
					{bgType === 'image' && backdrop ? (
						<Image source={backdrop} style={tw`absolute inset-0`} />
					) : bgType === 'color' && bgColor && (
						<View style={[tw`absolute inset-0`, { backgroundColor: bgColor.color }]} />
					)}
					<ScaledCapture
					ref={viewShotRef}
					targetWidth={SOCIAL_CARD_WIDTH}
					renderContent={renderSticker}
					/>
					{EditButtons}
				</View>
				{EditOptions}
			</View>
			{EditSelectors}
		</View>
	);
});
ShareMovie.displayName = 'ShareMovie';