import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { UserActivity } from "@/types/type.db";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageType, ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import UserAvatar from "@/components/user/UserAvatar";
import FeedUserActivity from "@/components/screens/feed/FeedUserActivity";
import { CardReview } from "@/components/cards/CardReview";
import { Href, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { FixedOmit } from "@/types";
import { Skeleton } from "../ui/Skeleton";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

interface CardFeedItemBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
		onPosterPress?: () => void;
	}

type CardFeedItemSkeletonProps = {
	skeleton: true;
	// activity?: never;
	title?: never;
	description?: never;
	posterUrl?: never;
	posterType?: never;
	content?: never;
	footer?: never;
};

type CardFeedItemDataProps = {
	skeleton?: false;
	// activity: UserActivity;
	title: string;
	description?: string;
	posterUrl?: string;
	posterType?: ImageType;
	content?: React.ReactNode;
	footer?: React.ReactNode;
};

export type CardFeedItemProps = CardFeedItemBaseProps &
	(CardFeedItemSkeletonProps | CardFeedItemDataProps);

const CardFeedItemDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedItemProps, "variant" | "onPress">
>(({ style, children, title, description, posterUrl, posterType, content, footer, onPosterPress, onLongPress, skeleton, ...props }, ref) => {
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
				<Pressable onPress={onPosterPress} onLongPress={onLongPress}>
					<ImageWithFallback
					source={{ uri: posterUrl ?? '' }}
					alt={title}
					type={posterType}
					style={tw`w-20 h-full`}
					/>
				</Pressable>
			) : (
				<Skeleton style={tw`w-20 h-full`} />
			)}
			<View style={tw`flex-1 gap-2 p-2`}>
				{content}
				<View style={tw`gap-2`}>
					{!skeleton ? (
						<Text numberOfLines={2} style={tw`font-bold`}>
						{title}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						!skeleton ? (
							<Text
							textColor={!description ? "muted" : undefined}
							numberOfLines={2}
							style={tw`text-xs text-justify`}
							>
								{description || upperFirst(t('common.messages.no_description'))}
							</Text>
						) : <Skeleton style={tw`w-full h-12`} />
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedItemDefault.displayName = "CardFeedItemDefault";

const CardFeedItem = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedItemProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const content = (
		variant === "default" ? (
			<CardFeedItemDefault ref={ref} onLongPress={onLongPress} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={onPress}
		onLongPress={onLongPress}
		>
			{content}
		</Pressable>
	)
});
CardFeedItem.displayName = "CardFeedItem";

export {
	CardFeedItem,
	CardFeedItemDefault,
}