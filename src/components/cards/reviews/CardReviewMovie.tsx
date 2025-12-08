import * as React from "react"
import { Profile, UserActivityMovie, UserReviewMovie, FixedOmit } from "@recomendapp/types";
import Animated from "react-native-reanimated";
import { Pressable, View } from "react-native";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { IconMediaRating } from "@/components/medias/IconMediaRating";
import { CardUser } from "../CardUser";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/Skeleton";
import ButtonUserReviewMovieLike from "@/components/buttons/ButtonUserReviewMovieLike";
import { BottomSheetReviewMovie } from "@/components/bottom-sheets/sheets/BottomSheetReviewMovie";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { convert } from "html-to-text";

interface CardReviewMovieBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
		linked?: boolean;
	}

type CardReviewMovieSkeletonProps = {
  skeleton: true;
  review?: never;
  activity?: never;
  author?: never;
  url?: never;
};

type CardReviewMovieDataProps = {
  skeleton?: false;
  review: UserReviewMovie;
  activity: UserActivityMovie;
  author: Profile;
  url: Href;
};

export type CardReviewMovieProps = CardReviewMovieBaseProps &
  (CardReviewMovieSkeletonProps | CardReviewMovieDataProps);

const CardReviewMovieDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardReviewMovieProps, "variant" | "linked" | "onPress" | "onLongPress" | "url">
>(({ review, skeleton, activity, author, children, style, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
			ref={ref}
			style={[
				{ backgroundColor: colors.card, borderColor: colors.muted },
				tw.style("flex-row gap-2 p-1 w-full rounded-md border"),
				style,
			]}
			{...props}
		>
			<View style={tw.style("items-center gap-1 shrink")}>
				<IconMediaRating rating={activity?.rating} skeleton={skeleton} />
			</View>
			<View style={tw.style("w-full flex-col gap-1 shrink")}>
				{!skeleton ? <CardUser variant="inline" user={author} /> : <CardUser variant="inline" skeleton={skeleton} />}
				{review?.title && (
					!skeleton ? (
						<Text numberOfLines={1} style={tw.style("font-semibold")}>
							{review?.title}
						</Text>
					) : <Skeleton style={tw.style("h-4 w-1/3")} />
				)}
				{!skeleton ? (
					<Text numberOfLines={3} style={tw.style("text-sm text-justify")}>
						{convert(review.body, {
							selectors: [
								{ selector: 'a', options: { ignoreHref: true } },
							]
						})}
					</Text>
				) : <Skeleton style={tw.style("h-12 w-full")} />}
				{!skeleton && (
					<View style={tw.style("flex-row items-center justify-end m-1")}>
						<ButtonUserReviewMovieLike reviewId={review?.id} reviewLikesCount={review.likes_count} />
					</View>
				)}
			</View>
		</Animated.View>
	);
});
CardReviewMovieDefault.displayName = "CardReviewMovieDefault";


const CardReviewMovie = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardReviewMovieProps
>(({ linked = true, variant = "default", url, onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const content = (
		variant === "default" ? (
			<CardReviewMovieDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={() => {
			if (linked) router.push(url as Href);
			onPress?.();
		}}
		onLongPress={() => {
			openSheet(BottomSheetReviewMovie, {
				review: props.review,
			});
			onLongPress?.();
		}}
		>
			{content}
		</Pressable>
	);
});
CardReviewMovie.displayName = "CardReviewMovie";

export {
	CardReviewMovie,
	CardReviewMovieDefault,
}
