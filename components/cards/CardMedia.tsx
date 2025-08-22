import * as React from "react"
import { Media, UserActivity } from "@/types/type.db";
import { ThemedText } from "../ui/ThemedText";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Pressable, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMedia from "../bottom-sheets/sheets/BottomSheetMedia";
import { IconMediaRating } from "../medias/IconMediaRating";
import { FixedOmit } from "@/types";
import { Skeleton } from "../ui/Skeleton";
import app from "@/constants/app";

interface CardMediaBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		activity?: UserActivity;
		profileActivity?: UserActivity;
		linked?: boolean;
		disableActions?: boolean;
		children?: React.ReactNode;
		// Stats
		showRating?: boolean;
		// Actions
		showActionRating?: boolean;
		hideMediaType?: boolean;
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardMediaSkeletonProps = {
	skeleton: true;
	media?: never;
};

type CardMediaDataProps = {
	skeleton?: false;
	media: Media;
};

export type CardMediaProps = CardMediaBaseProps &
	(CardMediaSkeletonProps | CardMediaDataProps);

const CardMediaDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardMediaProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, media, skeleton, activity, showActionRating, profileActivity, children, showRating, ...props }, ref) => {
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
					source={{uri: media.avatar_url ?? ''}}
					alt={media.title ?? ''}
					type={media.media_type}
					style={{
						aspectRatio: 2 / 3,
						width: 'auto',
					}}
				/> : <Skeleton style={{ aspectRatio: 2 / 3, width: 'auto' }} />}
				<View style={tw`shrink px-2 py-1 gap-1`}>
					{!skeleton ? <ThemedText numberOfLines={2}>{media.title}</ThemedText> : <Skeleton style={tw.style('w-full h-5')} />}
					{children}
				</View>
			</View>
			{!skeleton && (
				(showActionRating || showRating) && (
					<View style={tw`flex-row items-center gap-2`}>
						{showRating && <IconMediaRating rating={activity?.rating} />}
					</View>
				)
			)}
		</Animated.View>
	);
});
CardMediaDefault.displayName = "CardMediaDefault";

const CardMediaPoster = React.forwardRef<
React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardMediaProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, media, skeleton, activity, profileActivity, disableActions, showRating, children, ...props }, ref) => {
	const voteAverage = media?.vote_count! > app.ratings.countThreshold ? media?.vote_average : media?.tmdb_vote_average;
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
				source={{uri: media.avatar_url ?? ''}}
				alt={media.title ?? ''}
				type={media.media_type}
			/> : <Skeleton style={tw.style('w-full h-full')} />}
			{!skeleton && (voteAverage
			|| profileActivity?.rating
			|| profileActivity?.is_liked
			|| profileActivity?.review
			) ? (
				<View style={tw`absolute top-1 right-1 flex-col gap-1`}>
					{voteAverage ?
					<IconMediaRating
					rating={voteAverage}
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
CardMediaPoster.displayName = "CardMediaPoster";

const CardMedia = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardMediaProps
>(({ variant = "default", linked = true, onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const content = (
		variant === "default" ? (
			<CardMediaDefault ref={ref} {...props} />
		) : variant == "poster" ? (
			<CardMediaPoster ref={ref} {...props} />
		) : null
	)

	if (props.skeleton) return content;

	return (
	<Pressable
	onPress={() => {
		if (linked) router.push(props.media.url as Href);
		onPress?.();
	}}
	onLongPress={() => {
		openSheet(BottomSheetMedia, {
			media: props.media,
		});
		onLongPress?.();
	}}
	>
		{content}
	</Pressable>
	);
});
CardMedia.displayName = "CardMedia";

export {
	CardMedia,
	CardMediaDefault,
	CardMediaPoster,
}