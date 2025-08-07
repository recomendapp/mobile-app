import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { UserActivity } from "@/types/type.db";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import UserAvatar from "@/components/user/UserAvatar";
import FeedActivity from "@/components/screens/feed/FeedActivity";
import { CardReview } from "@/components/cards/CardReview";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useRouter } from "expo-router";
import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import { Text } from "@/components/ui/text";
import { FixedOmit } from "@/types";
import { Skeleton } from "../ui/Skeleton";

interface CardUserActivityBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		showReview?: boolean;
		onPress?: () => void;
		onLongPress?: () => void;
		linked?: boolean;
	}

type CardUserActivitySkeletonProps = {
	skeleton: true;
	activity?: never;
};

type CardUserActivityDataProps = {
	skeleton?: false;
	activity: UserActivity;
};

export type CardUserActivityProps = CardUserActivityBaseProps &
	(CardUserActivitySkeletonProps | CardUserActivityDataProps);

const CardUserActivityDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardUserActivityProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, activity, children, showReview, skeleton, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
			ref={ref}
			style={[
				{ backgroundColor: skeleton ? colors.background : colors.card, borderColor: colors.border },
				tw`flex-row rounded-xl p-1 gap-2 border overflow-hidden`,
				style
			]}
			{...props}
		>
			{!skeleton ? <ImageWithFallback
			source={{uri: activity.media?.avatar_url ?? ''}}
			alt={activity.media?.title ?? ''}
			type={activity.media?.media_type}
			style={tw`w-20 h-full`}
			/> : <Skeleton style={tw`w-20 h-full`} />}
			<View style={tw`shrink gap-2 p-2 w-full`}>
				<View style={tw`flex-row items-center gap-2`}>
					{!skeleton ? <UserAvatar avatar_url={activity?.user?.avatar_url} full_name={activity?.user?.full_name!} style={tw`w-6 h-6`} /> : <UserAvatar skeleton style={tw`w-6 h-6`} />}
					{!skeleton ? <FeedActivity activity={activity} style={[{ color: colors.mutedForeground }, tw`text-sm`]} /> : <Skeleton />}
				</View>
				<View style={tw`gap-2`}>
					{!skeleton ? <Text numberOfLines={2} style={tw`font-bold`}>
						{activity?.media?.title}
					</Text> : <Skeleton style={tw`w-full h-5`} />}
					{(showReview && activity?.review) ? (
						<CardReview activity={activity} review={activity?.review} author={activity?.user!} style={{ backgroundColor: colors.background }} />
					) : (
						!skeleton ? (
							<Text
							variant={!activity?.media?.extra_data.overview || !activity?.media?.extra_data.overview.length ? "muted" : undefined}
							numberOfLines={2}
							style={tw`text-xs text-justify`}
							>
								{(activity?.media?.extra_data.overview && activity?.media?.extra_data.overview.length) ? activity?.media?.extra_data.overview : 'Aucune description'}
							</Text>
						) : <Skeleton style={tw`w-full h-12`} />
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardUserActivityDefault.displayName = "CardUserActivityDefault";

const CardUserActivity = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardUserActivityProps
>(({ variant = "default", onPress, onLongPress, linked = false, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const content = (
		variant === "default" ? (
			<CardUserActivityDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={() => {
			if (linked) router.push(`/user/${props.activity.user?.username}`);
			onPress?.();
		}}
		onLongPress={() => {
			const {
				media,
				...activity
			} = props.activity;
			openSheet(BottomSheetMedia, {
				media: media,
				activity: activity,
			});
			onLongPress?.();
		}}
		>
			{content}
		</Pressable>
	)
});
CardUserActivity.displayName = "CardUserActivity";

export {
	CardUserActivity,
	CardUserActivityDefault,
}