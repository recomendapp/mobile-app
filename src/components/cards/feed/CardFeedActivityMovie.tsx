import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaMovie, Profile, UserActivityMovie, FixedOmit } from "@recomendapp/types";
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
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { CardUser } from "../CardUser";
import { CardReviewMovie } from "../reviews/CardReviewMovie";
import { GAP } from "@/theme/globals";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";

interface CardFeedActivityMovieBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedActivityMovieSkeletonProps = {
	skeleton: true;
	author?: never;
	activity?: never;
	movie?: never;
	footer?: never;
};

type CardFeedActivityMovieDataProps = {
	skeleton?: false;
	author: Profile;
	activity: UserActivityMovie;
	movie: MediaMovie;
	footer?: React.ReactNode;
};

export type CardFeedActivityMovieProps = CardFeedActivityMovieBaseProps &
	(CardFeedActivityMovieSkeletonProps | CardFeedActivityMovieDataProps);

const CardFeedActivityMovieDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedActivityMovieProps, "variant" | "onPress" | "onLongPress">
>(({ style, children, author, activity, movie, footer, skeleton, ...props }, ref) => {
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
				source={{ uri: getTmdbImage({ path: movie?.poster_path, size: 'w342' }) ?? '' }}
				alt={movie.title ?? ''}
				type={'movie'}
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
						{movie.title}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{footer || (
						skeleton
							? <Skeleton style={tw`w-full h-12`} />
							: activity.review ? (
								<CardReviewMovie
								author={author}
								activity={activity!}
								review={activity.review!}
								url={{
									pathname: '/film/[film_id]/review/[review_id]',
									params: {
										film_id: movie.slug || movie.id,
										review_id: activity.review.id
									}
								}}
								/>
							) : (
								<Text
								textColor={!movie.overview ? "muted" : undefined}
								numberOfLines={2}
								style={tw`text-xs text-justify`}
								>
									{movie.overview || upperFirst(t('common.messages.no_description'))}
								</Text>
							)
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedActivityMovieDefault.displayName = "CardFeedActivityMovieDefault";

const CardFeedActivityMovie = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedActivityMovieProps
>(({ variant = "default", onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const handleOnPress = React.useCallback(() => {
		if (!props.movie) return;
		router.push(props.movie.url as Href);
		onPress?.();
	}, [onPress, props.movie, router]);
	const handleOnLongPress = React.useCallback(() => {
		if (!props.movie) return;
		openSheet(BottomSheetMovie, {
			movie: props.movie
		})
		onLongPress?.();
	}, [onLongPress, openSheet, props.movie]);
	const content = (
		variant === "default" ? (
			<CardFeedActivityMovieDefault ref={ref} {...props} />
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
CardFeedActivityMovie.displayName = "CardFeedActivityMovie";

export {
	CardFeedActivityMovie,
	CardFeedActivityMovieDefault,
}