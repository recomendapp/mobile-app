import tw from "@/lib/tw";
import { MediaTvSeries, Profile } from "@recomendapp/types";
import * as React from "react"
import Animated, { runOnJS } from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { View } from "react-native";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { FixedOmit } from "@recomendapp/types";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardUser } from "../CardUser";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface CardNotificationRecoCompletedTvSeriesBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
	}

type CardNotificationRecoCompletedTvSeriesSkeletonProps = {
	skeleton: true;
	receiver?: never;
	tvSeries?: never;
};

type CardNotificationRecoCompletedTvSeriesDataProps = {
	skeleton?: false;
	receiver: Profile;
	tvSeries: MediaTvSeries;
};

export type CardNotificationRecoCompletedTvSeriesProps = CardNotificationRecoCompletedTvSeriesBaseProps &
	(CardNotificationRecoCompletedTvSeriesSkeletonProps | CardNotificationRecoCompletedTvSeriesDataProps);

const CardNotificationRecoCompletedTvSeriesDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardNotificationRecoCompletedTvSeriesProps, "variant">
>(({ style, children, receiver, tvSeries, skeleton, onPress, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	const onUserPress = React.useCallback(() => {
		if (!receiver?.username) return;
		router.canGoBack() && router.back();
		router.push(`/user/${receiver.username}`);
		onPress?.();
	}, [router, receiver?.username]);
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
			<View style={tw`flex-1 gap-2`}>
				{!skeleton ? <View style={tw`flex-row gap-1`}>
					<CardUser linked={false}  user={receiver} variant="icon" onPress={onUserPress} />
					<Text>
					{t.rich('notifications.reco_completed_tv_series.description', {
						user: () => (
						<Text onPress={onUserPress} style={tw`font-semibold`}>
							{receiver.username}
						</Text>
						),
						tv_series: () => (
						<Text style={tw`font-semibold`}>
							{tvSeries.name}
						</Text>
						),
					})}
					</Text>
				</View> : <Skeleton style={tw`w-full h-6`} />}
			</View>
			{!skeleton ? (
				<ImageWithFallback
				source={{ uri: tvSeries.poster_url ?? '' }}
				alt={tvSeries.name ?? ''}
				type={'tv_series'}
				style={[
					{ aspectRatio: 9 / 16 },
					tw`w-10`
				]}
				/>
			) : (
				<Skeleton style={[{ aspectRatio: 9 / 16 }, tw`w-10`]} />
			)}
		</Animated.View>
	);
});
CardNotificationRecoCompletedTvSeriesDefault.displayName = "CardNotificationRecoCompletedTvSeriesDefault";

const CardNotificationRecoCompletedTvSeries = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardNotificationRecoCompletedTvSeriesProps
>(({ variant = "default", ...props }, ref) => {
	const router = useRouter();
	const navigate = React.useCallback(() => {
		if (props.skeleton) return;
		router.canGoBack() && router.back();
		router.push(props.tvSeries?.url as Href);
		props.onPress?.();
	}, [router, props.tvSeries?.url, props.onPress]);
	const tapGesture = React.useMemo(() => (
		Gesture.Tap()
			.maxDuration(250)
			.onEnd((_e, success) => {
				if (success) {
					runOnJS(navigate)();
				}
			})
	), [navigate]);
	const content = (
		variant === "default" ? (
			<CardNotificationRecoCompletedTvSeriesDefault ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<GestureDetector gesture={tapGesture}>
			{content}
		</GestureDetector>
	)
});
CardNotificationRecoCompletedTvSeries.displayName = "CardNotificationRecoCompletedTvSeries";

export {
	CardNotificationRecoCompletedTvSeries,
	CardNotificationRecoCompletedTvSeriesDefault,
}