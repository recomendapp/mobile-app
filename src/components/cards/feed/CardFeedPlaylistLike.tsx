import * as React from "react"
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { PlaylistLike, Profile, FixedOmit } from "@recomendapp/types";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetPlaylist from "@/components/bottom-sheets/sheets/BottomSheetPlaylist";
import { CardUser } from "../CardUser";
import { GAP } from "@/theme/globals";

interface CardFeedPlaylistLikeBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedPlaylistLikeSkeletonProps = {
	skeleton: true;
	author?: never;
	playlistLike?: never;
	footer?: never;
};

type CardFeedPlaylistLikeDataProps = {
	skeleton?: false;
	author: Profile;
	playlistLike: PlaylistLike;
	footer?: React.ReactNode;
};

export type CardFeedPlaylistLikeProps = CardFeedPlaylistLikeBaseProps &
	(CardFeedPlaylistLikeSkeletonProps | CardFeedPlaylistLikeDataProps);

const CardFeedPlaylistLikeDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedPlaylistLikeProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, author, playlistLike, footer, skeleton, ...props }, ref) => {
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
				source={{ uri: playlistLike.playlist?.poster_url ?? '' }}
				alt={playlistLike.playlist?.title ?? ''}
				type={'playlist'}
				style={tw`w-20 min-h-20 h-full`}
				/>
			) : (
				<Skeleton style={tw`w-20 aspect-square h-full`} />
			)}
			<View style={tw`flex-1 gap-2 p-2`}>
				{!skeleton ? <View style={tw`flex-row gap-1`}>
					<CardUser user={author} variant="icon" />
					<Text style={[{ color: colors.mutedForeground }, tw`text-sm`]} numberOfLines={2}>
						{t.rich('common.messages.user_liked_playlist', {
							name: () => (
								<Text style={tw`font-semibold`}>{author.full_name}</Text>
							)
						})}
					</Text>
				</View> : <Skeleton style={tw`w-full h-6`} />}
				<View style={tw`gap-2`}>
					{!skeleton ? (
						<Text numberOfLines={2} style={tw`font-bold`}>
						{playlistLike.playlist?.title}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						!skeleton ? (
							playlistLike.playlist?.description && (
								<Text
								numberOfLines={2}
								style={tw`text-xs text-justify`}
								>
									{playlistLike.playlist?.description}
								</Text>
							)
						) : <Skeleton style={tw`w-full h-12`} />
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedPlaylistLikeDefault.displayName = "CardFeedPlaylistLikeDefault";

const CardFeedPlaylistLike = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedPlaylistLikeProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const handleOnPress = React.useCallback(() => {
		if (!props.playlistLike) return;
		router.push({
			pathname: '/playlist/[playlist_id]',
			params: { playlist_id: props.playlistLike.playlist_id }
		});
		onPress?.();
	}, [onPress, props.playlistLike, router]);
	const handleOnLongPress = React.useCallback(() => {
		if (!props.playlistLike) return;
		openSheet(BottomSheetPlaylist, {
			playlist: props.playlistLike.playlist!
		})
		onLongPress?.();
	}, [onLongPress, openSheet, props.playlistLike]);
	const content = (
		variant === "default" ? (
			<CardFeedPlaylistLikeDefault ref={ref} {...props} />
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
CardFeedPlaylistLike.displayName = "CardFeedPlaylistLike";

export {
	CardFeedPlaylistLike,
	CardFeedPlaylistLikeDefault,
}