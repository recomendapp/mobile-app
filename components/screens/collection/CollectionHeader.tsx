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

interface CollectionHeaderProps
	extends React.ComponentPropsWithoutRef<typeof Animated.View> {
		headerHeight: SharedValue<number>;
		scrollY: SharedValue<number>;
		title: string;
		numberOfItems: number;
		backdrops: (string | null | undefined)[];
		loading: boolean;
	}

const CollectionHeader = forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CollectionHeaderProps
>(({ loading, headerHeight, scrollY, title, numberOfItems, backdrops, ...props }, ref) => {
	const { colors, inset } = useTheme();
	const { hslToRgb } = useColorConverter();
	const bgBackdrop = useRandomBackdrop(backdrops);
	const bgColor = hslToRgb(colors.background);
	const navigationHeaderHeight = useHeaderHeight();

	const layoutY = useSharedValue(0);
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

	return (
		<Animated.View
		ref={ref}
		style={[
			opacityAnim,
		]}
		onLayout={(event) => {
			'worklet';
			headerHeight.value = event.nativeEvent.layout.height;
			layoutY.value = event.nativeEvent.layout.y;
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
				tw`items-center justify-center px-4 pb-4 h-40`,
				{
					marginTop: navigationHeaderHeight > 0 ? navigationHeaderHeight : inset.top,
				}
			]}
			>
				<Text
				style={[
					{ color: colors.accentYellow },
					tw`text-4xl font-bold`,
				]}
				>
					{title}
				</Text>
				{!loading ? <Text style={[{ color: colors.mutedForeground }]}>
					{numberOfItems} items
				</Text> : <Skeleton style={tw`h-4 w-10`} />}
			</Animated.View>
		</Animated.View>
	)
});
CollectionHeader.displayName = "CollectionHeader";

export default CollectionHeader;