import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaTvSeries, Profile, UserReviewTvSeriesLike, FixedOmit } from "@recomendapp/types";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { CardUser } from "../CardUser";
import { CardReviewTvSeries } from "../reviews/CardReviewTvSeries";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { GAP } from "@/theme/globals";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";

interface CardFeedReviewTvSeriesLikeBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedReviewTvSeriesLikeSkeletonProps = {
	skeleton: true;
	author?: never;
	reviewLike?: never;
	tvSeries?: never;
	footer?: never;
};

type CardFeedReviewTvSeriesLikeDataProps = {
	skeleton?: false;
	author: Profile;
	reviewLike: UserReviewTvSeriesLike;
	tvSeries: MediaTvSeries;
	footer?: React.ReactNode;
};

export type CardFeedReviewTvSeriesLikeProps = CardFeedReviewTvSeriesLikeBaseProps &
	(CardFeedReviewTvSeriesLikeSkeletonProps | CardFeedReviewTvSeriesLikeDataProps);

const CardFeedReviewTvSeriesLikeDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedReviewTvSeriesLikeProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, author, reviewLike, tvSeries, footer, skeleton, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	return (
		<Animated.View
			ref={ref}
			style={[
				{ gap: GAP * 2 },
				tw`flex-row rounded-xl`,
				style
			]}
			{...props}
		>
			{!skeleton ? (
				<ImageWithFallback
				source={{ uri: getTmdbImage({ path: tvSeries?.poster_path, size: 'w342' }) ?? '' }}
				alt={tvSeries.name ?? ''}
				type={'tv_series'}
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
						{tvSeries.name}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						!skeleton ? (
							<CardReviewTvSeries
							author={reviewLike.review?.activity?.user!}
							activity={reviewLike.review?.activity!}
							review={reviewLike.review!}
							url={`${tvSeries.url}/review/${reviewLike.review_id}` as Href}
							/>
						) : <Skeleton style={tw`w-full h-12`} />
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedReviewTvSeriesLikeDefault.displayName = "CardFeedReviewTvSeriesLikeDefault";

const CardFeedReviewTvSeriesLike = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedReviewTvSeriesLikeProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const handleOnPress = React.useCallback(() => {
		if (!props.tvSeries) return;
		router.push(props.tvSeries.url as Href);
		onPress?.();
	}, [onPress, props.tvSeries, router]);
	const handleOnLongPress = React.useCallback(() => {
		if (!props.tvSeries) return;
		openSheet(BottomSheetTvSeries, {
			tvSeries: props.tvSeries
		})
		onLongPress?.();
	}, [onLongPress, openSheet, props.tvSeries]);
	const content = (
		variant === "default" ? (
			<CardFeedReviewTvSeriesLikeDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={handleOnPress}
		onLongPress={handleOnLongPress}
		>
			{content}
		</Pressable>
	)
});
CardFeedReviewTvSeriesLike.displayName = "CardFeedReviewTvSeriesLike";

export {
	CardFeedReviewTvSeriesLike,
	CardFeedReviewTvSeriesLikeDefault,
}