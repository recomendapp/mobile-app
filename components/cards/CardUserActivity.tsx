import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { UserActivity } from "@/types/type.db";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import UserAvatar from "../user/UserAvatar";
import { ThemedText } from "../ui/ThemedText";
import FeedActivity from "../screens/feed/FeedActivity";
import { CardReview } from "./CardReview";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useRouter } from "expo-router";
import BottomSheetMedia from "../bottom-sheets/sheets/BottomSheetMedia";
import { Icons } from "@/constants/Icons";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";

interface CardUserActivityProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		activity: UserActivity;
		showReview?: boolean;
		linked?: boolean;
	}

const CardUserActivityDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	Omit<CardUserActivityProps, "variant">
>(({ style, activity, children, showReview, ...props }, ref) => {
	const { colors } = useTheme();
	// const format = useFormatter();
	// const now = useNow({ updateInterval: 1000 * 10 });
	return (
		<Animated.View
			ref={ref}
			style={[
				{ backgroundColor: colors.card, borderColor: colors.border },
				tw`flex-row rounded-xl p-1 gap-2 border`,
				style
			]}
			{...props}
		>
			<ImageWithFallback
			source={{uri: activity.media?.avatar_url ?? ''}}
			alt={activity.media?.title ?? ''}
			type={activity.media?.media_type}
			style={tw`w-20 h-full`}
			/>
			<View style={tw`shrink gap-2 p-2 w-full`}>
				<View style={tw`flex-row justify-between`}>
					<View style={tw`flex-row items-center gap-2`}>
						{activity.user?.username ? <UserAvatar avatar_url={activity?.user?.avatar_url} full_name={activity?.user?.full_name} style={tw`w-6 h-6`} /> : null}
						<FeedActivity activity={activity} style={[{ color: colors.mutedForeground }, tw`text-sm`]} />
					</View>
					<View>
						{/* <Text style={[{ color: colors.mutedForeground }, tw`text-sm`]}>{format.relativeTime(new Date(activity?.watched_date ?? ''), now)}</Text> */}
					</View>
				</View>
				<View style={tw`gap-2`}>
					<ThemedText numberOfLines={2} style={tw`font-bold`}>
						{activity?.media?.title}
					</ThemedText>
					{(showReview && activity?.review) ? (
						<CardReview activity={activity} review={activity?.review} author={activity?.user!} style={{ backgroundColor: colors.background }} />
					) : (
						<ThemedText
						numberOfLines={2}
						style={[
							tw`text-xs text-justify`,
							(!activity?.media?.extra_data.overview || !activity?.media?.extra_data.overview.length) && { color: colors.mutedForeground },
						]}
						>
							{(activity?.media?.extra_data.overview && activity?.media?.extra_data.overview.length) ? activity?.media?.extra_data.overview : 'Aucune description'}
						</ThemedText>
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
>(({ variant = "default", linked = false, ...props }, ref) => {
	const router = useRouter();
	const { t } = useTranslation();
	const { openSheet } = useBottomSheetStore();
	const onPress = () => {
		router.push(`/user/${props.activity.user?.username}`);
	};
	const onLongPress = () => {
		openSheet(BottomSheetMedia, {
			media: props.activity.media,
			additionalItemsTop: [
				{
				icon: Icons.Feed,
				onPress: () => router.push(`/user/${props.activity.user?.username}`),
				label: upperFirst(t('common.messages.go_to_activity')),
				},
			]
		})
	};
	return (
		<Pressable
		onPress={linked ? onPress : undefined}
		onLongPress={onLongPress}
		>
			{variant === "default" ? (
				<CardUserActivityDefault ref={ref} {...props} />
			) : null}
		</Pressable>
	)
});
CardUserActivity.displayName = "CardUserActivity";

export {
	type CardUserActivityProps,
	CardUserActivity,
	CardUserActivityDefault,
}