
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaMovie, User, UserActivityMovie } from "@recomendapp/types";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import FeedUserActivity from "@/components/screens/feed/FeedUserActivity";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { FixedOmit } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { CardUser } from "../CardUser";
import { CardReviewMovie } from "../reviews/CardReviewMovie";

interface CardNotificationRecoSentBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardNotificationRecoSentSkeletonProps = {
	skeleton: true;
	sender?: never;
	movie?: never;
};

type CardNotificationRecoSentDataProps = {
	skeleton?: false;
	sender: User;
	movie: MediaMovie;
};

export type CardNotificationRecoSentProps = CardNotificationRecoSentBaseProps &
	(CardNotificationRecoSentSkeletonProps | CardNotificationRecoSentDataProps);

const CardNotificationRecoSentDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardNotificationRecoSentProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, sender, movie, skeleton, ...props }, ref) => {
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
					<CardUser user={sender} variant="icon" />
					<></>
				</View> : <Skeleton style={tw`w-full h-6`} />}
			</View>
		</Animated.View>
	);
});
CardNotificationRecoSentDefault.displayName = "CardNotificationRecoSentDefault";

const CardNotificationRecoSent = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardNotificationRecoSentProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const content = (
		variant === "default" ? (
			<CardNotificationRecoSentDefault ref={ref} {...props} />
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
CardNotificationRecoSent.displayName = "CardNotificationRecoSent";

export {
	CardNotificationRecoSent,
	CardNotificationRecoSentDefault,
}