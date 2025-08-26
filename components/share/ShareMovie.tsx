import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { View } from "../ui/view";
import { MediaMovie } from "@/types/type.db";
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
import { useFormatter } from "use-intl";
import { useMediaMovieBackdropInfiniteQuery, useMediaMoviePosterInfiniteQuery } from "@/features/media/mediaQueries";
import { Image } from "expo-image";
import { CaptureResult, ShareViewRef } from "./type";
import { useAuth } from "@/providers/AuthProvider";
import { CircleIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cropImageRatio } from "@/utils/imageManipulator";
import { ColorPair, useImageColorPairs } from "@/hooks/useImageColorPairs";
import { useRouter } from "expo-router";
import { ScaledCapture } from "../ui/ScaledCapture";
import app from "@/constants/app";

interface ShareMovieProps extends React.ComponentProps<typeof ViewShot> {
	movie: MediaMovie;
	variant?: 'default';
};

const ITEM_WIDTH = 64;
const ITEM_SPACING = 8;

/* -------------------------------- VARIANTS -------------------------------- */
const ShareMovieDefault = ({ movie, poster, scale = 1 } : { movie: MediaMovie, poster: string | undefined, scale?: number }) => {
	const { colors } = useTheme();
	const format = useFormatter();
	return (
		<View style={[{ borderRadius: BORDER_RADIUS * scale, backgroundColor: colors.muted, gap: GAP * scale, padding: PADDING / 2 * scale }]}>
			<ImageWithFallback
			source={{uri: poster ?? '' }}
			alt={movie.title ?? ''}
			type={'movie'}
			style={[
				{ aspectRatio: 2 / 3, borderRadius: BORDER_RADIUS * scale },
				tw`w-full h-auto`
			]}
			/>
			<View>
			<Text style={[tw`font-bold`, { fontSize: 16 * scale }]}>{movie.title}</Text>
			{movie.directors && <Text textColor="muted" style={{ fontSize: 12 * scale }}>{format.list(movie.directors.map(d => d.name!), {style: 'short',type: 'unit'})}</Text>}
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
		data: posters,
		hasNextPage,
		fetchNextPage,
	} = useMediaMoviePosterInfiniteQuery({
		movieId: movie.id,
	})
	return (
		<WheelSelector
		entering={FadeInDown}
		exiting={FadeOutDown}
		data={posters?.pages.flat() ?? []}
		renderItem={(item, index) => (
			<ImageWithFallback
				source={{ uri: item.poster_url ?? '' }}
				alt={movie.title ?? ''}
				type={"movie"}
				style={[{ aspectRatio: 2 / 3, width: ITEM_WIDTH }]}
			/>
		)}
		onSelectionChange={(item) => setPoster(item.poster_url!)}
		initialIndex={posters?.pages.flat().findIndex(p => p.poster_url === poster) ?? 0}
		enableHaptics={true}
		itemWidth={ITEM_WIDTH}
		itemSpacing={ITEM_SPACING}
		wheelAngle={0}
		wheelIntensity={0.2}
		containerStyle={tw`absolute bottom-0`}
		onEndReached={() => hasNextPage && fetchNextPage()}
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
	const { colorPairs } = useImageColorPairs(poster);
	const {
		data: posters,
		hasNextPage,
		fetchNextPage,
	} = useMediaMovieBackdropInfiniteQuery({
		movieId: movie.id,
	});
	return (
		<View style={tw`absolute bottom-0`}>
			{bgType === 'image' ? (
				<WheelSelector
				entering={FadeInDown}
				exiting={FadeOutDown}
				data={posters?.pages.flat() ?? []}
				renderItem={(item, index) => (
					<ImageWithFallback
						source={{ uri: item.backdrop_url ?? '' }}
						alt={movie.title ?? ''}
						type={"movie"}
						style={[{ aspectRatio: 2 / 3, width: ITEM_WIDTH }]}
					/>

				)}
				onSelectionChange={(item) => setBackdrop(item.backdrop_url!)}
				initialIndex={posters?.pages.flat().findIndex(p => p.backdrop_url === backdrop) ?? 0}
				enableHaptics={true}
				itemWidth={ITEM_WIDTH}
				itemSpacing={ITEM_SPACING}
				wheelAngle={0}
				wheelIntensity={0.2}
				onEndReached={() => hasNextPage && fetchNextPage()}
				/>
			) : (
				<WheelSelector
				entering={FadeInDown}
				exiting={FadeOutDown}
				data={colorPairs}
				renderItem={(item, index) => (
					<Animated.View style={[{ borderColor: colors.border, width: ITEM_WIDTH, height: ITEM_WIDTH }, tw`border-2 rounded-full overflow-hidden`]}>
						<LinearGradient style={tw`absolute inset-0`} colors={[item.top, item.bottom]}/>
					</Animated.View>

				)}
				onSelectionChange={(item, index) => setBgColor({ index, colors: item })}
				initialIndex={bgColor?.index ?? 0}
				enableHaptics={true}
				itemWidth={ITEM_WIDTH}
				itemSpacing={ITEM_SPACING}
				wheelAngle={0}
				wheelIntensity={0.2}
				onEndReached={() => hasNextPage && fetchNextPage()}
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
	const { user } = useAuth();
	const router = useRouter();
	const viewShotRef = useRef<ViewShot>(null);

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
	const renderEditingOptions = useCallback(() => {
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
	}, [editing, activeEditingOption, movie, bgType, bgColor]);
	const renderEditingButtons = useCallback(() => (
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
				if (!user || !user.premium) {
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
	), [editing, activeEditingOption, bgType, user, bgColor, backdrop]);

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
				<View style={[{ aspectRatio: 9/16, paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, borderRadius: BORDER_RADIUS },tw`relative h-96 items-center justify-center overflow-hidden`]}>
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
					{renderEditingButtons()}
				</View>
				{renderEditingOptions()}
			</View>
			{editing && (
				<>
				<WheelSelector
				data={editOptions}
				extraData={activeEditingOption}
				entering={FadeInDown}
				exiting={FadeOutDown}
				renderItem={(item, isActive) => (
					<Button
					variant={isActive ? "accent-yellow" : "outline"}
					icon={item.icon}
					size="icon"
					style={[tw`rounded-full`, { width: HEIGHT, height: HEIGHT }]}
					/>
				)}
				onSelectionChange={(item) => setActiveEditingOption(item.value)}
				initialIndex={editOptions.findIndex(e => e.value === activeEditingOption)}
				enableHaptics={true}
				itemWidth={HEIGHT}
				style={{ marginVertical: PADDING_VERTICAL }}
				/>
			</>
			)}
		</View>
	);
});
ShareMovie.displayName = 'ShareMovie';
