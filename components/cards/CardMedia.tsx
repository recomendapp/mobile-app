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
import MediaActionUserActivityRating from "../medias/actions/MediaActionUserActivityRating";

interface CardMediaProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		media: Media;
		activity?: UserActivity;
		profileActivity?: UserActivity;
		linked?: boolean;
		posterClassName?: string;
		disableActions?: boolean;
		showRating?: boolean;
		showAction?: {
			rating?: boolean;
		}
		hideMediaType?: boolean;
		index?: number;
		children?: React.ReactNode;
	}

const CardMediaDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	Omit<CardMediaProps, "variant">
>(({ style, media, activity, showAction, profileActivity, children, linked, showRating, posterClassName, ...props }, ref) => {
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
				<ImageWithFallback
					source={{uri: media.avatar_url ?? ''}}
					alt={media.title ?? ''}
					type={media.media_type}
					style={{
						aspectRatio: 2 / 3,
						width: 'auto',
					}}
				/>
				<View style={tw`shrink px-2 py-1 gap-1`}>
					<ThemedText numberOfLines={2}>{media.title}</ThemedText>
					{children}
				</View>
			</View>
			{showAction || showRating ? (
			<View style={tw`flex-row items-center gap-2`}>
				{showAction?.rating ? (
					<MediaActionUserActivityRating media={media} />
				) : null}
				{showRating ? (
					<IconMediaRating rating={activity?.rating} />
				) : null}
			</View>
 			) : null}
		</Animated.View>
	);
});
CardMediaDefault.displayName = "CardMediaDefault";

const CardMediaPoster = React.forwardRef<
React.ComponentRef<typeof Animated.View>,
	Omit<CardMediaProps, "variant">
>(({ style, media, activity, profileActivity, linked, disableActions, showRating, children, ...props }, ref) => {
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
			<ImageWithFallback
				source={{uri: media.avatar_url ?? ''}}
				alt={media.title ?? ''}
				type={media.media_type}
			/>
			{(media.vote_average
			|| media.tmdb_vote_average
			|| profileActivity?.rating
			|| profileActivity?.is_liked
			|| profileActivity?.review
			) ? (
				<View style={tw`absolute top-1 right-1 flex-col gap-1`}>
					{(media.vote_average || media.tmdb_vote_average) ?
					<IconMediaRating
					rating={media.vote_average ?? media.tmdb_vote_average}
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
>(({ hideMediaType = true, showRating = true, linked = true, variant = "default", ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const onPress = () => {
		if (linked && props.media.url) {
			router.push(props.media.url as Href);
		}
	};
	const onLongPress = () => {
		openSheet(BottomSheetMedia, {
			media: props.media,
		});
	};
	return (
	<Pressable
	onPress={onPress}
	onLongPress={onLongPress}
	>
		{variant === "default" ? (
			<CardMediaDefault ref={ref} linked={linked} showRating={showRating} {...props} />
		) : variant == "poster" ? (
			<CardMediaPoster ref={ref} linked={linked} showRating={showRating} {...props} />
		// ) : variant == "row" ? (
			// <CardMediaRow ref={ref} className={cn(linked ? 'cursor-pointer' : '', className)} media={media} linked={linked} onClick={customOnClick} showRating={showRating} hideMediaType={hideMediaType} {...props} />
		) : null}
	</Pressable>
	);
});
CardMedia.displayName = "CardMedia";

export {
	type CardMediaProps,
	CardMedia,
	CardMediaDefault,
	CardMediaPoster,
}