import tw from "@/lib/tw";
import { Profile, FixedOmit } from "@recomendapp/types";
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

interface CardNotificationFollowerAcceptedBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
	}

type CardNotificationFollowerAcceptedSkeletonProps = {
	skeleton: true;
	followee?: never;
};

type CardNotificationFollowerAcceptedDataProps = {
	skeleton?: false;
	followee: Profile;
};

export type CardNotificationFollowerAcceptedProps = CardNotificationFollowerAcceptedBaseProps &
	(CardNotificationFollowerAcceptedSkeletonProps | CardNotificationFollowerAcceptedDataProps);

const CardNotificationFollowerAcceptedDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardNotificationFollowerAcceptedProps, "variant">
>(({ style, children, followee, skeleton, onPress, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	const onUserPress = React.useCallback(() => {
		if (!followee?.username) return;
		router.push({
			pathname: '/user/[username]',
			params: { username: followee.username }
		});
		onPress?.();
	}, [router, followee?.username, onPress]);
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
			{!skeleton ? <View style={tw`flex-row gap-1`}>
				<CardUser linked={false} user={followee} variant="icon" style={tw`w-20`} onPress={onUserPress} />
				<Text>
				{t.rich('notifications.follower_accepted.description', {
					user: () => (
					<Text onPress={onUserPress} style={tw`font-semibold`}>
						{followee.username}
					</Text>
					)
				})}
				</Text>
			</View> : <Skeleton style={tw`w-full h-6`} />}
		</Animated.View>
	);
});
CardNotificationFollowerAcceptedDefault.displayName = "CardNotificationFollowerAcceptedDefault";

const CardNotificationFollowerAccepted = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardNotificationFollowerAcceptedProps
>(({ variant = "default", ...props }, ref) => {
	const router = useRouter();
	const navigate = () => {
		if (props.skeleton) return;
		router.push({
			pathname: '/user/[username]',
			params: { username: props.followee.username! }
		});
		props.onPress?.();
	};
	const tapGesture = Gesture.Tap()
		.maxDuration(250)
		.onEnd((_e, success) => {
			if (success) {
				scheduleOnRN(navigate);
			}
		})
	const content = (
		variant === "default" ? (
			<CardNotificationFollowerAcceptedDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<GestureDetector gesture={tapGesture}>
			{content}
		</GestureDetector>
	)
});
CardNotificationFollowerAccepted.displayName = "CardNotificationFollowerAccepted";

export {
	CardNotificationFollowerAccepted,
	CardNotificationFollowerAcceptedDefault,
}