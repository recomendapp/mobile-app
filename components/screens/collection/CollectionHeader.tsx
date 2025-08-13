import { useTheme } from "@/providers/ThemeProvider";
import useColorConverter from "@/hooks/useColorConverter";
import tw from "@/lib/tw";
import React, { forwardRef } from "react";
import { Text } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import useRandomBackdrop from "@/hooks/useRandomBackdrop";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useHeaderHeight } from '@react-navigation/elements';
import { Skeleton } from "@/components/ui/Skeleton";
import { View } from "@/components/ui/view";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { ImageType } from "@/components/utils/ImageWithFallback";

interface CollectionHeaderProps
	extends React.ComponentPropsWithoutRef<typeof Animated.View> {
		headerHeight: SharedValue<number>;
		scrollY: SharedValue<number>;
		title: string;
		showPoster?: boolean;
		poster?: string;
		posterType?: ImageType;
		bottomText?: string | React.ReactNode | (() => React.ReactNode);
		numberOfItems: number;
		backdrops: (string | null | undefined)[];
		loading: boolean;
	}

const CollectionHeader = forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CollectionHeaderProps
>(({ loading, headerHeight, scrollY, title, showPoster = false, poster, posterType, bottomText, numberOfItems, backdrops, ...props }, ref) => {
	const { colors, inset } = useTheme();
	const { hslToRgb } = useColorConverter();
	const bgBackdrop = useRandomBackdrop(backdrops);
	const bgColor = hslToRgb(colors.background);
	const navigationHeaderHeight = useHeaderHeight();

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
					{showPoster && (
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
					)}
					<Text
					numberOfLines={2}
					style={[
						{ color: colors.accentYellow },
						tw`text-4xl font-bold text-center`,
					]}
					>
						{title}
					</Text>
					{!loading ? <Text numberOfLines={1} style={[{ color: colors.mutedForeground }]}>
						{numberOfItems} items
					</Text> : <Skeleton style={tw`h-4 w-10`} />}
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