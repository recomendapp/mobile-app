import * as React from "react"
import { MediaMovie, UserActivityMovie } from "@recomendapp/types";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Pressable, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { IconMediaRating } from "../medias/IconMediaRating";
import { FixedOmit } from "@recomendapp/types";
import { Skeleton } from "../ui/Skeleton";
import BottomSheetMovie from "../bottom-sheets/sheets/BottomSheetMovie";
import { Text } from "../ui/text";
import ButtonUserActivityMovieRating from "../buttons/movies/ButtonUserActivityMovieRating";

interface CardMovieBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		activity?: UserActivityMovie;
		profileActivity?: UserActivityMovie;
		linked?: boolean;
		children?: React.ReactNode;
		// Stats
		showRating?: boolean;
		// Actions
		showActionRating?: boolean;
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardMovieSkeletonProps = {
	skeleton: true;
	movie?: never;
};

type CardMovieDataProps = {
	skeleton?: false;
	movie: MediaMovie;
};

export type CardMovieProps = CardMovieBaseProps &
	(CardMovieSkeletonProps | CardMovieDataProps);

const CardMovieDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardMovieProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, movie, skeleton, activity, showActionRating, profileActivity, children, showRating, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw`flex-row justify-between items-center rounded-xl h-20 p-1 gap-2 border overflow-hidden`,
			style,
		]}
		{...props}
		>
			<View style={tw`flex-1 flex-row items-center gap-2`}>
				{!skeleton ? <ImageWithFallback
					source={{uri: movie.poster_url ?? ''}}
					alt={movie.title ?? ''}
					type={'movie'}
					style={{
						aspectRatio: 2 / 3,
						width: 'auto',
					}}
				/> : <Skeleton style={{ aspectRatio: 2 / 3, width: 'auto' }} />}
				<View style={tw`shrink px-2 py-1 gap-1`}>
					{!skeleton ? <Text numberOfLines={2}>{movie.title}</Text> : <Skeleton style={tw.style('w-full h-5')} />}
					{children}
				</View>
			</View>
			{!skeleton && (
				(showActionRating || showRating) && (
					<View style={tw`flex-row items-center gap-2`}>
						{showActionRating && <ButtonUserActivityMovieRating movie={movie} />}
						{showRating && <IconMediaRating rating={activity?.rating} />}
					</View>
				)
			)}
		</Animated.View>
	);
});
CardMovieDefault.displayName = "CardMovieDefault";

const CardMoviePoster = React.forwardRef<
React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardMovieProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, movie, skeleton, activity, profileActivity, showRating, children, ...props }, ref) => {
	return (
		<Animated.View
			ref={ref}
			style={[
				{ aspectRatio: 2 / 3 },
				tw.style('relative flex gap-4 items-center w-32 shrink-0 rounded-sm border-transparent overflow-hidden'),
				style,
			]}
			{...props}
		>
			{!skeleton ? <ImageWithFallback
				source={{uri: movie.poster_url ?? ''}}
				alt={movie.title ?? ''}
				type={'movie'}
			/> : <Skeleton style={tw.style('w-full h-full')} />}
			{!skeleton && (movie.vote_average
			|| profileActivity?.rating
			|| profileActivity?.is_liked
			|| profileActivity?.review
			) ? (
				<View style={tw`absolute top-1 right-1 flex-col gap-1`}>
					{movie.vote_average ?
					<IconMediaRating
					rating={movie.vote_average}
					/> : null}
					{(profileActivity?.is_liked
					|| profileActivity?.rating
					|| profileActivity?.review) ? (
					<IconMediaRating
					rating={profileActivity.rating}
					variant="profile"
					/>) : null}
				</View>
			) : null}
		</Animated.View>
	);
});
CardMoviePoster.displayName = "CardMoviePoster";

const CardMovie = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardMovieProps
>(({ variant = "default", linked = true, onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const content = (
		variant === "default" ? (
			<CardMovieDefault ref={ref} {...props} />
		) : variant == "poster" ? (
			<CardMoviePoster ref={ref} {...props} />
		) : null
	)

	if (props.skeleton) return content;

	return (
	<Pressable
	onPress={() => {
		if (linked) router.push(props.movie.url as Href);
		onPress?.();
	}}
	onLongPress={() => {
		openSheet(BottomSheetMovie, {
			movie: props.movie,
		});
		onLongPress?.();
	}}
	>
		{content}
	</Pressable>
	);
});
CardMovie.displayName = "CardMovie";

export {
	CardMovie,
	CardMovieDefault,
	CardMoviePoster,
}