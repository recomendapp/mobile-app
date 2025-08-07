import * as React from "react"
import { JSONContent, User, UserActivity, UserReview } from "@/types/type.db";
import Animated from "react-native-reanimated";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemedText } from "../ui/ThemedText";
import { IconMediaRating } from "../medias/IconMediaRating";
import { CardUser } from "./CardUser";
import ActionReviewLike from "../reviews/actions/ActionReviewLike";
import { Skeleton } from "../ui/Skeleton";
import { FixedOmit } from "@/types";

interface CardReviewBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
		linked?: boolean;
	}

type CardReviewSkeletonProps = {
  skeleton: true;
  review?: never;
  activity?: never;
  author?: never;
};

type CardReviewDataProps = {
  skeleton?: false;
  review: UserReview;
  activity: UserActivity;
  author: User;
};

export type CardReviewProps = CardReviewBaseProps &
  (CardReviewSkeletonProps | CardReviewDataProps);

const CardReviewDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardReviewProps, "variant" | "linked" | "onPress" | "onLongPress">
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
						<ThemedText numberOfLines={1} style={tw.style("font-semibold")}>
							{review?.title}
						</ThemedText>
					) : (
						<Skeleton style={tw.style("h-4 w-1/3")} />
					)
				)}
				{!skeleton ? (
					<Overview data={review?.body} />
				) : (
					<Skeleton style={tw.style("h-12 w-full")} />
				)}
				{!skeleton && (
					<View style={tw.style("flex-row items-center justify-end m-1")}>
						<ActionReviewLike reviewId={review?.id} reviewLikesCount={review.likes_count} />
					</View>
				)}
			</View>
		</Animated.View>
	);
});
CardReviewDefault.displayName = "CardReviewDefault";


const CardReview = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardReviewProps
>(({ linked = true, variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();

	const content = (
		variant === "default" ? (
			<CardReviewDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={() => {
			if (linked) router.push(`/review/${props.review?.id}`);
			onPress?.();
		}}
		onLongPress={() => {
			onLongPress?.();
		}}
		>
			{content}
		</Pressable>
	);
});
CardReview.displayName = "CardReview";

const Overview = ({ data }: { data: JSONContent }) => {
	const text = data?.content
		?.filter((paragraph) => paragraph?.content)
		?.flatMap(
			(paragraph) => paragraph?.content?.map((item) => item.text).join('')
		)
		.join('\n');
	return (
	<ThemedText numberOfLines={3} style={tw.style("text-justify")}>
		{text}
	</ThemedText>
	);
};

export {
	CardReview,
	CardReviewDefault,
	Overview,
}
