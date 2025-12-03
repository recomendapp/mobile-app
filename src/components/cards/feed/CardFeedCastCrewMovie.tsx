import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaMovie, MediaPerson, FixedOmit } from "@recomendapp/types";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Pressable, View } from "react-native";
import { Href, Link, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import UserAvatar from "@/components/user/UserAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { BadgeMedia } from "@/components/badges/BadgeMedia";
import { GAP } from "@/theme/globals";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";

interface CardFeedCastCrewMovieBaseProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardFeedCastCrewMovieSkeletonProps = {
	skeleton: true;
	movie?: never;
	person?: never;
	jobs?: never;
};

type CardFeedCastCrewMovieDataProps = {
	skeleton?: false;
	movie: MediaMovie;
	person: MediaPerson;
	jobs: string[];
};

export type CardFeedCastCrewMovieProps = CardFeedCastCrewMovieBaseProps &
	(CardFeedCastCrewMovieSkeletonProps | CardFeedCastCrewMovieDataProps);

const CardFeedCastCrewMovieDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardFeedCastCrewMovieProps, "variant" | "onPress">
>(({ style, children, movie, person, jobs, onLongPress, skeleton, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	return (
		<Animated.View
			ref={ref}
			style={[
				{ gap: GAP * 2 },
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
				style={[tw`w-20 h-full`, { backgroundColor: colors.background }]}
				/>
			) : (
				<Skeleton style={tw`w-20 h-full`} />
			)}
			<View style={tw`flex-1 gap-2 p-2`}>
				<View style={tw`flex-row items-center gap-1`}>
					{!skeleton ? (
						<Pressable onPress={() => router.push(person.url as Href)}>
							<UserAvatar avatar_url={person.profile_url} full_name={person.name ?? ''} style={tw`rounded-md`}/>
						</Pressable>
					) : <Skeleton style={tw`w-6 h-6 rounded-md`} />}
					{!skeleton ? (
						<Text textColor="muted">
							{t.rich('pages.feed.cast_and_crew.label', {
								name: person.name!,
								roles: jobs.length ? jobs.join(', ').toLowerCase() : t('common.messages.unknown'),
								linkPerson: (chunk) => <Link href={person?.url as Href} style={{ color: colors.foreground }}>{chunk}</Link>,
								important: (chunk) => <Text textColor="default">{chunk}</Text>
							})}
						</Text>
					) : <Skeleton style={tw`w-40 h-4`} />}
				</View>
				<View style={tw`gap-2`}>
					{!skeleton ? (
						<Text numberOfLines={2} style={tw`font-bold`}>
						{movie.title}
						</Text>
 					) : <Skeleton style={tw`w-full h-5`} />}
					{!skeleton ? <BadgeMedia type={'movie'} /> : <Skeleton style={tw`w-20 h-5 rounded-full`} />}
					{!skeleton ? (
						<Text
						textColor={!movie.overview ? "muted" : undefined}
						numberOfLines={2}
						style={tw`text-xs text-justify`}
						>
							{movie.overview || upperFirst(t('common.messages.no_description'))}
						</Text>
					) : <Skeleton style={tw`w-full h-12`} />}
				</View>
			</View>
		</Animated.View>
	);
});
CardFeedCastCrewMovieDefault.displayName = "CardFeedCastCrewMovieDefault";

const CardFeedCastCrewMovie = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardFeedCastCrewMovieProps
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
			<CardFeedCastCrewMovieDefault ref={ref} onLongPress={onLongPress} {...props} />
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
CardFeedCastCrewMovie.displayName = "CardFeedCastCrewMovie";

export {
	CardFeedCastCrewMovie,
	CardFeedCastCrewMovieDefault,
}