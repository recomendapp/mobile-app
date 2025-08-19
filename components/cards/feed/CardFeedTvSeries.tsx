import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaTvSeries, UserActivityTvSeries } from "@/types/type.db";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import UserAvatar from "@/components/user/UserAvatar";
import FeedUserActivity from "@/components/screens/feed/FeedUserActivity";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { FixedOmit } from "@/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";

interface CardFeedTvSeriesBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedTvSeriesSkeletonProps = {
	skeleton: true;
	activity?: never;
	tvSeries?: never;
	footer?: never;
};

type CardFeedTvSeriesDataProps = {
	skeleton?: false;
	activity: UserActivityTvSeries;
	tvSeries: MediaTvSeries;
	footer?: React.ReactNode;
};

export type CardFeedTvSeriesProps = CardFeedTvSeriesBaseProps &
	(CardFeedTvSeriesSkeletonProps | CardFeedTvSeriesDataProps);

const CardFeedTvSeriesDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedTvSeriesProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, activity, tvSeries, footer, skeleton, ...props }, ref) => {
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
				source={{ uri: tvSeries.poster_url ?? '' }}
				alt={tvSeries.name ?? ''}
				type={'tv_series'}
				style={tw`w-20 h-full`}
				/>
			) : (
				<Skeleton style={tw`w-20 h-full`} />
			)}
			<View style={tw`flex-1 gap-2 p-2`}>
				{!skeleton ? <View style={tw`flex-row items-center gap-1`}>
					<UserAvatar avatar_url={activity.user?.avatar_url} full_name={activity.user?.full_name!} style={tw`w-6 h-6`} />
					<FeedUserActivity activity={activity} style={[{ color: colors.mutedForeground }, tw`text-sm`]} />
				</View> : <Skeleton style={tw`w-full h-6`} />}
				<View style={tw`gap-2`}>
					{!skeleton ? (
						<Text numberOfLines={2} style={tw`font-bold`}>
						{tvSeries.name}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						!skeleton ? (
							<Text
							textColor={!tvSeries.overview ? "muted" : undefined}
							numberOfLines={2}
							style={tw`text-xs text-justify`}
							>
								{tvSeries.overview || upperFirst(t('common.messages.no_description'))}
							</Text>
						) : <Skeleton style={tw`w-full h-12`} />
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedTvSeriesDefault.displayName = "CardFeedTvSeriesDefault";

const CardFeedTvSeries = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedTvSeriesProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const content = (
		variant === "default" ? (
			<CardFeedTvSeriesDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={() => {
			router.push(props.tvSeries.url as Href);
			onPress?.();
		}}
		onLongPress={() => {
			// TODO: open sheet
			onLongPress?.();
		}}
		>
			{content}
		</Pressable>
	)
});
CardFeedTvSeries.displayName = "CardFeedTvSeries";

export {
	CardFeedTvSeries,
	CardFeedTvSeriesDefault,
}