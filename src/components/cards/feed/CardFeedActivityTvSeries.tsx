import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaTvSeries, Profile, UserActivityTvSeries, FixedOmit } from "@recomendapp/types";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import FeedUserActivity from "@/components/screens/feed/FeedUserActivity";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { CardUser } from "../CardUser";
import { CardReviewTvSeries } from "../reviews/CardReviewTvSeries";
import { GAP } from "@/theme/globals";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";

interface CardFeedActivityTvSeriesBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedActivityTvSeriesSkeletonProps = {
	skeleton: true;
	author?: never;
	activity?: never;
	tvSeries?: never;
	footer?: never;
};

type CardFeedActivityTvSeriesDataProps = {
	skeleton?: false;
	author: Profile;
	activity: UserActivityTvSeries;
	tvSeries: MediaTvSeries;
	footer?: React.ReactNode;
};

export type CardFeedActivityTvSeriesProps = CardFeedActivityTvSeriesBaseProps &
	(CardFeedActivityTvSeriesSkeletonProps | CardFeedActivityTvSeriesDataProps);

const CardFeedActivityTvSeriesDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedActivityTvSeriesProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, author, activity, tvSeries, footer, skeleton, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	return (
		<Animated.View
			ref={ref}
			style={[
				{ gap: GAP },
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
					<FeedUserActivity author={author} activity={activity} style={[{ color: colors.mutedForeground }, tw`text-sm`]} />
				</View> : <Skeleton style={tw`w-full h-6`} />}
				<View style={tw`gap-2`}>
					{!skeleton ? (
						<Text numberOfLines={2} style={tw`font-bold`}>
						{tvSeries.name}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						skeleton
							? <Skeleton style={tw`w-full h-12`} />
							: activity.review ? (
								<CardReviewTvSeries
								author={author}
								activity={activity!}
								review={activity.review!}
								url={{
									pathname: '/tv-series/[tv_series_id]/review/[review_id]',
									params: {
										tv_series_id: tvSeries.slug || tvSeries.id,
										review_id: activity.review.id
									}
								}}
								/>
							) : (
								<Text
								textColor={!tvSeries.overview ? "muted" : undefined}
								numberOfLines={2}
								style={tw`text-xs text-justify`}
								>
									{tvSeries.overview || upperFirst(t('common.messages.no_description'))}
								</Text>
							) 
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedActivityTvSeriesDefault.displayName = "CardFeedActivityTvSeriesDefault";

const CardFeedActivityTvSeries = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedActivityTvSeriesProps
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
			<CardFeedActivityTvSeriesDefault ref={ref} {...props} />
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
CardFeedActivityTvSeries.displayName = "CardFeedActivityTvSeries";

export {
	CardFeedActivityTvSeries,
	CardFeedActivityTvSeriesDefault,
}