import * as React from "react"
import { User, UserActivity, UserReview } from "@/types/type.db";
import { JSONContent } from "@tiptap/react";
import Animated from "react-native-reanimated";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemedText } from "../ui/ThemedText";
import { IconMediaRating } from "../medias/IconMediaRating";
import { CardUser } from "./CardUser";
import ActionReviewLike from "../reviews/actions/ActionReviewLike";
import { useFormatter, useNow } from "use-intl";
import { Text } from "../ui/text";

interface CardReviewProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		review: UserReview;
		activity: UserActivity;
		author: User;
		linked?: boolean;
	}

const CardReviewDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	Omit<CardReviewProps, "variant">
>(({ review, activity, author, linked, children, style, ...props }, ref) => {
	const now = useNow({ updateInterval: 1000 * 10 });
	// const format = useFormatter();
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
				<IconMediaRating rating={activity?.rating!} />
				{/* <View style={[{ backgroundColor: colors.mutedForeground }, tw.style("h-full w-0.5 rounded-full")]} /> */}
			</View>
			<View style={tw.style("w-full flex-col gap-1 shrink")}>
				<CardUser variant="inline" user={author} />
				{review?.title ? (
					<ThemedText numberOfLines={1} style={tw.style("font-semibold")}>
						{review?.title}
					</ThemedText>
				) : null}
				<Overview data={review?.body} />
				<View style={tw.style("flex-row items-center justify-end m-1")}>
					<ActionReviewLike reviewId={review?.id} reviewLikesCount={review.likes_count} />
				</View>
			</View>
		</Animated.View>
	);
});
CardReviewDefault.displayName = "CardReviewDefault";


const CardReview = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardReviewProps
>(({ review, linked = true, variant = "default", ...props }, ref) => {
	const router = useRouter();
	const onPress = () => {
		if (linked) {
			router.push(`/review/${review?.id}`);
		}
	};
	return (
		<Pressable onPress={onPress}>
			{variant === "default" ? (
				<CardReviewDefault ref={ref} review={review} linked={linked} {...props} />
			) : null}
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
	type CardReviewProps,
	CardReview,
	CardReviewDefault,
	Overview,
}
