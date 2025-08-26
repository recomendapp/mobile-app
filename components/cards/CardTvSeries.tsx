import * as React from "react"
import { MediaTvSeries, UserActivityTvSeries } from "@recomendapp/types";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Pressable, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { IconMediaRating } from "../medias/IconMediaRating";
import { FixedOmit } from "@recomendapp/types";
import { Skeleton } from "../ui/Skeleton";
import BottomSheetTvSeries from "../bottom-sheets/sheets/BottomSheetTvSeries";
import { Text } from "../ui/text";
import ButtonUserActivityTvSeriesRating from "../buttons/tv-series/ButtonUserActivityTvSeriesRating";

interface CardTvSeriesBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		activity?: UserActivityTvSeries;
		profileActivity?: UserActivityTvSeries;
		linked?: boolean;
		children?: React.ReactNode;
		// Stats
		showRating?: boolean;
		// Actions
		showActionRating?: boolean;
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardTvSeriesSkeletonProps = {
	skeleton: true;
	tvSeries?: never;
};

type CardTvSeriesDataProps = {
	skeleton?: false;
	tvSeries: MediaTvSeries;
};

export type CardTvSeriesProps = CardTvSeriesBaseProps &
	(CardTvSeriesSkeletonProps | CardTvSeriesDataProps);

const CardTvSeriesDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardTvSeriesProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, tvSeries, skeleton, activity, showActionRating, profileActivity, children, showRating, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw`flex-row justify-between items-center rounded-xl h-20 p-1 gap-2 border overflow-hidden`,
			style,
		]}
		{...props}
		>
			<View style={tw`flex-1 flex-row items-center gap-2`}>
				{!skeleton ? <ImageWithFallback
					source={{uri: tvSeries.poster_url ?? ''}}
					alt={tvSeries.name ?? ''}
					type={'tv_series'}
					style={{
						aspectRatio: 2 / 3,
						width: 'auto',
					}}
				/> : <Skeleton style={{ aspectRatio: 2 / 3, width: 'auto' }} />}
				<View style={tw`shrink px-2 py-1 gap-1`}>
					{!skeleton ? <Text numberOfLines={2}>{tvSeries.name}</Text> : <Skeleton style={tw.style('w-full h-5')} />}
					{children}
				</View>
			</View>
			{!skeleton && (
				(showActionRating || showRating) && (
					<View style={tw`flex-row items-center gap-2`}>
						{showActionRating && <ButtonUserActivityTvSeriesRating tvSeries={tvSeries} />}
						{showRating && <IconMediaRating rating={activity?.rating} />}
					</View>
				)
			)}
		</Animated.View>
	);
});
CardTvSeriesDefault.displayName = "CardTvSeriesDefault";

const CardTvSeriesPoster = React.forwardRef<
React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardTvSeriesProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, tvSeries, skeleton, activity, profileActivity, showRating, children, ...props }, ref) => {
	return (
		<Animated.View
			ref={ref}
			style={[
				{ aspectRatio: 2 / 3 },
				tw.style('relative flex gap-4 items-center w-32 shrink-0 rounded-sm border-transparent overflow-hidden'),
				style,
			]}
			{...props}
		>
			{!skeleton ? <ImageWithFallback
				source={{uri: tvSeries.poster_url ?? ''}}
				alt={tvSeries.name ?? ''}
				type={'tv_series'}
			/> : <Skeleton style={tw.style('w-full h-full')} />}
			{!skeleton && (tvSeries.vote_average
			|| profileActivity?.rating
			|| profileActivity?.is_liked
			|| profileActivity?.review
			) ? (
				<View style={tw`absolute top-1 right-1 flex-col gap-1`}>
					{tvSeries.vote_average ?
					<IconMediaRating
					rating={tvSeries.vote_average}
					/> : null}
					{(profileActivity?.is_liked
					|| profileActivity?.rating
					|| profileActivity?.review) ? (
					<IconMediaRating
					rating={profileActivity.rating}
					variant="profile"
					/>) : null}
				</View>
			) : null}
		</Animated.View>
	);
});
CardTvSeriesPoster.displayName = "CardTvSeriesPoster";

const CardTvSeries = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardTvSeriesProps
>(({ variant = "default", linked = true, onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const content = (
		variant === "default" ? (
			<CardTvSeriesDefault ref={ref} {...props} />
		) : variant == "poster" ? (
			<CardTvSeriesPoster ref={ref} {...props} />
		) : null
	)

	if (props.skeleton) return content;

	return (
	<Pressable
	onPress={() => {
		if (linked) router.push(props.tvSeries.url as Href);
		onPress?.();
	}}
	onLongPress={() => {
		openSheet(BottomSheetTvSeries, {
			tvSeries: props.tvSeries,
		});
		onLongPress?.();
	}}
	>
		{content}
	</Pressable>
	);
});
CardTvSeries.displayName = "CardTvSeries";

export {
	CardTvSeries,
	CardTvSeriesDefault,
	CardTvSeriesPoster,
}