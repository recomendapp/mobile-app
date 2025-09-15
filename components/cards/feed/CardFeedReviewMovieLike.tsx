import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaMovie, User, UserReviewMovieLike } from "@recomendapp/types";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { FixedOmit } from "@recomendapp/types";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { CardReviewMovie } from "../reviews/CardReviewMovie";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { CardUser } from "../CardUser";

interface CardFeedReviewMovieLikeBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedReviewMovieLikeSkeletonProps = {
	skeleton: true;
	author?: never;
	reviewLike?: never;
	movie?: never;
	footer?: never;
};

type CardFeedReviewMovieLikeDataProps = {
	skeleton?: false;
	author: User;
	reviewLike: UserReviewMovieLike;
	movie: MediaMovie;
	footer?: React.ReactNode;
};

export type CardFeedReviewMovieLikeProps = CardFeedReviewMovieLikeBaseProps &
	(CardFeedReviewMovieLikeSkeletonProps | CardFeedReviewMovieLikeDataProps);

const CardFeedReviewMovieLikeDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedReviewMovieLikeProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, author, reviewLike, movie, footer, skeleton, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	return (
		<Animated.View
			ref={ref}
			style={[
				{ backgroundColor: skeleton ? colors.background : colors.card, borderColor: colors.border },
				tw`flex-row rounded-xl p-1 gap-2 border`,
				style
			]}
			{...props}
		>
			{!skeleton ? (
				<ImageWithFallback
				source={{ uri: movie.poster_url ?? '' }}
				alt={movie.title ?? ''}
				type={'movie'}
				style={tw`w-20 h-full`}
				/>
			) : (
				<Skeleton style={tw`w-20 h-full`} />
			)}
			<View style={tw`flex-1 gap-2 p-2`}>
				{!skeleton ? <View style={tw`flex-row items-center gap-1`}>
					<CardUser user={author} variant="icon" />
					<Text style={[{ color: colors.mutedForeground }, tw`text-sm`]} numberOfLines={2}>
						{t.rich('common.messages.user_liked_review', {
							name: () => (
								<Text style={tw`font-semibold`}>{author.full_name}</Text>
							)
						})}
					</Text>
				</View> : <Skeleton style={tw`w-full h-6`} />}
				<View style={tw`gap-2`}>
					{!skeleton ? (
						<Text numberOfLines={2} style={tw`font-bold`}>
						{movie.title}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						!skeleton ? (
							<CardReviewMovie
							author={reviewLike.review?.activity?.user!}
							activity={reviewLike.review?.activity!}
							review={reviewLike.review!}
							url={`${movie.url}/review/${reviewLike.review_id}` as Href}
							style={{ backgroundColor: colors.background }}
							/>
						) : <Skeleton style={tw`w-full h-12`} />
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedReviewMovieLikeDefault.displayName = "CardFeedReviewMovieLikeDefault";

const CardFeedReviewMovieLike = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedReviewMovieLikeProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const content = (
		variant === "default" ? (
			<CardFeedReviewMovieLikeDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={() => {
			router.push(props.movie.url as Href);
			onPress?.();
		}}
		onLongPress={() => {
			openSheet(BottomSheetMovie, {
				movie: props.movie
			})
			onLongPress?.();
		}}
		>
			{content}
		</Pressable>
	)
});
CardFeedReviewMovieLike.displayName = "CardFeedReviewMovieLike";

export {
	CardFeedReviewMovieLike,
	CardFeedReviewMovieLikeDefault,
}