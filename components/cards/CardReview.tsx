import * as React from "react"
import { User, UserActivity, UserReview } from "@/types/type.db";
import { JSONContent } from "@tiptap/react";
// import { IconMediaRating } from "@/components/Media/icons/IconMediaRating";
// import ActionReviewLike from "@/components/Review/actions/ActionReviewLike";
import Animated from "react-native-reanimated";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";
import { useTranslation } from "react-i18next";
import useNow from "@/hooks/useNow";
import { ThemedText } from "../ui/ThemedText";
import { IconMediaRating } from "../medias/IconMediaRating";
import { CardUser } from "./CardUser";
import ActionReviewLike from "../reviews/actions/ActionReviewLike";

interface CardReviewProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		review: UserReview;
		activity: UserActivity;
		author: User;
		linked?: boolean;
	}

const CardReviewDefault = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardReviewProps, "variant">
>(({ review, activity, author, linked, children, style, ...props }, ref) => {
	const now = useNow({ updateInterval: 1000 * 10 });
	const { i18n } = useTranslation();
	// const format: Intl.RelativeTimeFormat = React.useMemo(
	// 	() =>
	// 		new Intl.RelativeTimeFormat(i18n.language, {
	// 			style: 'short',
	// 		}),
	// 	[i18n.language]
	// );
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
				<View style={tw.style("w-full flex-row justify-between items-center gap-2")}>
					<CardUser variant="inline" user={author} />
					<View style={[{ color: colors.mutedForeground }, tw.style('text-sm')]}>
						{/* {format.format((new Date(review?.updated_at ?? '').getTime() - now.getTime()) / 1000, 'seconds')} */}
					</View>
				</View>
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
	React.ElementRef<typeof Animated.View>,
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
