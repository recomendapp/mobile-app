import * as React from "react"
import { MediaTvSeriesSeason } from "@/types/type.db";
import { ThemedText } from "../ui/ThemedText";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Pressable, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { IconMediaRating } from "../medias/IconMediaRating";

interface CardTvSeriesSeasonProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		season: MediaTvSeriesSeason
		linked?: boolean;
		posterClassName?: string;
		disableActions?: boolean;
		showRating?: boolean;
		showAction?: {
			rating?: boolean;
		}
		hideMediaType?: boolean;
		index?: number;
		children?: React.ReactNode;
	}

const CardTvSeriesSeasonDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	Omit<CardTvSeriesSeasonProps, "variant">
>(({ style, season, showAction, children, linked, showRating, posterClassName, ...props }, ref) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw`items-center rounded-xl w-32 p-1 gap-2 border h-auto`,
			style,
		]}
		{...props}
		>
			<ImageWithFallback
				source={{uri: season.avatar_url ?? ''}}
				alt={season.title ?? ''}
				type={'tv_season'}
				style={[
					{ aspectRatio: 2 / 3 },
					tw`h-auto`
				]}
			>
				{showRating && (
					<IconMediaRating
					rating={season.tmdb_vote_average}
					variant="general"
					style={tw`absolute top-1 right-1`}
					/>
				)}
			</ImageWithFallback>
			
			<View style={tw`shrink px-2 py-1 gap-1`}>
				<ThemedText numberOfLines={1} style={tw`text-center`}>{upperFirst(t('common.messages.tv_season_value', { number: season.season_number! }))}</ThemedText>
				<ThemedText numberOfLines={1} style={[tw`text-center`, { color: colors.mutedForeground }]}>{upperFirst(t('common.messages.tv_episode_count', { count: season.episode_count! }))}</ThemedText>
				{children}
			</View>
		</Animated.View>
	);
});
CardTvSeriesSeasonDefault.displayName = "CardTvSeriesSeasonDefault";

const CardTvSeriesSeason = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardTvSeriesSeasonProps
>(({ hideMediaType = true, showRating = true, linked = true, variant = "default", ...props }, ref) => {
	const router = useRouter();
	const { openSheet } = useBottomSheetStore();
	const onPress = () => {
		if (linked && props.season.url) {
			router.push(props.season.url as Href);
		}
	};
	const onLongPress = () => {
		// openSheet(BottomSheetMedia, {
		// 	media: props.media,
		// });
	};
	return (
	<Pressable
	onPress={onPress}
	onLongPress={onLongPress}
	>
		{variant === "default" ? (
			<CardTvSeriesSeasonDefault ref={ref} linked={linked} showRating={showRating} {...props} />
		) : null}
	</Pressable>
	);
});
CardTvSeriesSeason.displayName = "CardTvSeriesSeason";

export {
	type CardTvSeriesSeasonProps,
	CardTvSeriesSeason,
	CardTvSeriesSeasonDefault,
}