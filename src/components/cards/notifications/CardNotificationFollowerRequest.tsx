import tw from "@/lib/tw";
import { Database, Profile, FixedOmit } from "@recomendapp/types";
import * as React from "react"
import Animated from "react-native-reanimated";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardUser } from "../CardUser";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

interface CardNotificationFollowerRequestBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
	}

type CardNotificationFollowerRequestSkeletonProps = {
	skeleton: true;
	notification?: never;
	follower?: never;
};

type CardNotificationFollowerRequestDataProps = {
	skeleton?: false;
	notification: Database['public']['Functions']['get_notifications']['Returns'][number];
	follower: Profile;
};

export type CardNotificationFollowerRequestProps = CardNotificationFollowerRequestBaseProps &
	(CardNotificationFollowerRequestSkeletonProps | CardNotificationFollowerRequestDataProps);

const CardNotificationFollowerRequestDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardNotificationFollowerRequestProps, "variant">
>(({ style, children, follower, skeleton, onPress, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	const onUserPress = React.useCallback(() => {
		if (!follower?.username) return;
		router.push({
			pathname: '/user/[username]',
			params: { username: follower.username }
		});
		onPress?.();
	}, [router, follower?.username, onPress]);
	return (
		<Animated.View
			ref={ref}
			style={[
				{
					backgroundColor: colors.background,
					paddingVertical: PADDING_VERTICAL,
					paddingLeft: PADDING_HORIZONTAL * 2,
					paddingRight: PADDING_HORIZONTAL,
					gap: GAP,
				},
				tw`flex-row items-center justify-between`,
				style
			]}
			{...props}
		>
			{!skeleton ? <View style={tw`flex-row items-center gap-1`}>
				<CardUser linked={false} user={follower} variant="icon" style={tw`w-20`} onPress={onUserPress} />
				<Text>
				{t.rich('notifications.follower_request.description', {
					user: () => (
					<Text onPress={onUserPress} style={tw`font-semibold`}>
						{follower.username}
					</Text>
					)
				})}
				</Text>
			</View> : <Skeleton style={tw`w-full h-6`} />}
		</Animated.View>
	);
});
CardNotificationFollowerRequestDefault.displayName = "CardNotificationFollowerRequestDefault";

const CardNotificationFollowerRequest = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardNotificationFollowerRequestProps
>(({ variant = "default", ...props }, ref) => {
	const router = useRouter();
	const navigate = () => {
		if (props.skeleton) return;
		router.push({
			pathname: '/follow-requests',
		})
		props.onPress?.();
	};
	const tapGesture = Gesture.Tap()
		.maxDuration(250)
		.onEnd((_e, success) => {
			if (success) {
				scheduleOnRN(navigate);
			}
		});
	const content = (
		variant === "default" ? (
			<CardNotificationFollowerRequestDefault ref={ref} {...props} />
		) : null
	);
	// Handler

	if (props.skeleton) return content;

	return (
		<GestureDetector gesture={tapGesture}>
			{content}
		</GestureDetector>
	)
});
CardNotificationFollowerRequest.displayName = "CardNotificationFollowerRequest";

export {
	CardNotificationFollowerRequest,
	CardNotificationFollowerRequestDefault,
}