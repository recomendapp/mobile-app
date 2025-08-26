import { useTheme } from "@/providers/ThemeProvider";
import useColorConverter from "@/hooks/useColorConverter";
import tw from "@/lib/tw";
import React, { forwardRef } from "react";
import { Dimensions, Text } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import useRandomBackdrop from "@/hooks/useRandomBackdrop";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useHeaderHeight } from '@react-navigation/elements';
import { Skeleton } from "@/components/ui/Skeleton";
import { View } from "@/components/ui/view";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { ImageType } from "@/components/utils/ImageWithFallback";
import { MediaType } from "@recomendapp/types";
import { useTranslations } from "use-intl";
import { PADDING_HORIZONTAL } from "@/theme/globals";

interface CollectionHeaderBaseProps
	extends React.ComponentPropsWithoutRef<typeof Animated.View> {
		headerHeight: SharedValue<number>;
		navigationHeaderHeight?: number;
		scrollY: SharedValue<number>;
		poster?: string;
		posterType?: ImageType;
		type?: MediaType;
	}

type CollectionHeaderLoadingProps = {
	loading: true;
	title?: never;
	hideTitle?: never;
	bottomText?: never;
	numberOfItems?: never;
	hideNumberOfItems?: never;
	backdrops?: never;
};

type CollectionHeaderLoadedProps = {
	loading?: boolean;
	title: string;
	hideTitle?: boolean;
	bottomText: string | React.ReactNode | (() => React.ReactNode);
	numberOfItems: number;
	hideNumberOfItems?: boolean;
	backdrops: (string | null | undefined)[];
}

type CollectionHeaderProps = CollectionHeaderBaseProps & (CollectionHeaderLoadedProps | CollectionHeaderLoadingProps);

const CollectionHeader = forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CollectionHeaderProps
>(({ loading, headerHeight, navigationHeaderHeight = useHeaderHeight(), scrollY, title, hideTitle, poster, posterType, bottomText, numberOfItems, hideNumberOfItems, backdrops, type, ...props }, ref) => {
	const { colors, inset } = useTheme();
	const { hslToRgb } = useColorConverter();
	const t = useTranslations();
	const bgBackdrop = useRandomBackdrop(backdrops || []);
	const bgColor = hslToRgb(colors.background);

	const posterHeight = useSharedValue(0);

	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - inset.top / 0.9],
				[1, 0],
				Extrapolation.CLAMP,
			),
		};
	});
	const scaleAnim = useAnimatedStyle(() => {
		const scaleValue = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[2, 1],
			Extrapolation.CLAMP,
		);
		const offset = (headerHeight.get() * (scaleValue - 1)) / 2;
		return {
			transform: [
				{ scale: scaleValue },
				{ translateY: -offset },
			],
		};
	});

	const posterAnim = useAnimatedStyle(() => {
		const scaleValue = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[3, 1],
			Extrapolation.CLAMP,
		);
		const scaleOffset = (posterHeight.get() * (scaleValue - 1)) / 2;
		const freezeScroll = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[-headerHeight.get(), 1],
			Extrapolation.CLAMP,
		);
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (navigationHeaderHeight) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{ scale: scaleValue },
				{ translateY: freezeScroll + scaleOffset },
			],
		};
	});

	const renderItemsCount = () => {
		if (numberOfItems === undefined) return null;
		switch (type) {
			case 'movie':
				return t('common.messages.film_count', { count: numberOfItems });
			case 'tv_series':
				return t('common.messages.tv_series_count', { count: numberOfItems });
			default:
				return t('common.messages.item_count', { count: numberOfItems });
		}
	}

	return (
		<Animated.View
		ref={ref}
		style={[
			opacityAnim,
		]}
		onLayout={(event) => {
			'worklet';
			headerHeight.value = event.nativeEvent.layout.height;
		}}
		{...props}
		>
			<Animated.View
			style={[
				tw`absolute inset-0`,
				{ left: -PADDING_HORIZONTAL, width: Dimensions.get('window').width },
				scaleAnim,
			]}
			>
				<Image style={tw`absolute inset-0`} source={bgBackdrop ?? 'https://media.giphy.com/media/Ic0IOSkS23UAw/giphy.gif'} />
				<LinearGradient
				style={tw`absolute inset-0`}
				colors={[
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.3)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.4)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.5)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.8)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`,
				]}
				/>
			</Animated.View>
			<Animated.View
			style={[
				tw`items-center justify-center px-4 pb-4 min-h-40 gap-2`,
				{
					marginTop: navigationHeaderHeight > 0 ? navigationHeaderHeight : inset.top,
				}
			]}
			>
				<View style={tw`items-center justify-center`}>
					{poster && (
						!loading ? (
							<AnimatedImageWithFallback
							onLayout={(e) => {
								posterHeight.value = e.nativeEvent.layout.height;
							}}
							alt={title}
							source={{ uri : poster }}
							style={[
								{ aspectRatio: 1 / 1 },
								tw`rounded-md w-48 h-auto mb-2`,
								posterAnim
							]}
							type={posterType}
							/>
						) : <Skeleton style={tw`w-48 h-48 rounded-md mb-2`} />
					)}
					{!hideTitle && (
						!loading ? <Text
						numberOfLines={2}
						style={[
							{ color: colors.accentYellow },
							tw`text-4xl font-bold text-center`,
						]}
						>
							{title}
						</Text> : <Skeleton style={tw`h-10 w-48`} />
					)}
					{!hideNumberOfItems && (
						!loading ? <Text numberOfLines={1} style={[{ color: colors.mutedForeground }]}>
							{renderItemsCount()}
						</Text> : <Skeleton style={tw`h-4 w-10`} />
					)}
				</View>
				{bottomText ? (
					typeof bottomText === 'function' ? (
						bottomText()
					) : (
						<Text numberOfLines={1}>
							{bottomText}
						</Text>
					)
				) : null}
			</Animated.View>
		</Animated.View>
	)
});
CollectionHeader.displayName = "CollectionHeader";

export default CollectionHeader;