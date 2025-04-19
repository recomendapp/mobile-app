import AnimatedImage from "@/components/ui/AnimatedImage";
import AnimatedLinearGradient from "@/components/ui/AnimatedLinearGradient";
import { useTheme } from "@/context/ThemeProvider";
import useColorConverter from "@/hooks/useColorConverter";
import tw from "@/lib/tw";
import React, { forwardRef } from "react";
import { Text } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import useRandomBackdrop from "@/hooks/useRandomBackdrop";

interface CollectionHeaderProps
	extends React.ComponentPropsWithoutRef<typeof Animated.View> {
		headerHeight: SharedValue<number>;
		headerOverlayHeight: SharedValue<number>;
		scrollY: SharedValue<number>;
		title: string;
		numberOfItems: number;
		backdrops: (string | null | undefined)[];
	}

const CollectionHeader = forwardRef<
	React.ElementRef<typeof Animated.View>,
	CollectionHeaderProps
>(({ headerHeight, headerOverlayHeight, scrollY, title, numberOfItems, backdrops, ...props }, ref) => {
	const { colors, inset } = useTheme();
	const { hslToRgb } = useColorConverter();
	const bgBackdrop = useRandomBackdrop(backdrops);
	const bgColor = hslToRgb(colors.background);

	const layoutY = useSharedValue(0);
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.9],
				[1, 0],
				Extrapolation.CLAMP,
			),
			// transform: [
			// 	{
			// 		translateY: interpolate(
			// 			scrollY.get(),
			// 			[layoutY.get() - 1, layoutY.get(), layoutY.get() + 1],
			// 			[1, 0, -1],
			// 		),
			// 	},
			// ],
		};
	});
	const scaleAnim = useAnimatedStyle(() => {
		return {
			transform: [
			{
				scale: interpolate(
					scrollY.get(),
					[-50, 0],
					[1.3, 1],
					{
						extrapolateLeft: 'extend',
						extrapolateRight: 'clamp',
					}
				),
			},
			],
		};
	});

	return (
		<Animated.View
		ref={ref}
		style={[
			// tw`absolute w-full`,
			opacityAnim,
		]}
		onLayout={(event) => {
			'worklet';
			headerHeight.value = event.nativeEvent.layout.height;
			layoutY.value = event.nativeEvent.layout.y;
		}}
		{...props}
		>
			<AnimatedImage
			style={[
				tw`absolute inset-0`,
				scaleAnim,
			]}
			source={{ uri: bgBackdrop ?? 'https://media.giphy.com/media/Ic0IOSkS23UAw/giphy.gif' }}
			/>
			<AnimatedLinearGradient
			style={[
				tw`absolute inset-0`,
				scaleAnim,
			]}
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
			<Animated.View
			style={[
				tw`items-center justify-center px-4 py-8 h-56`,
				{
					paddingTop: inset.top === 0 ? 8 : inset.top,
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
				<Text style={[{ color: colors.mutedForeground }]}>
					{numberOfItems} items
				</Text>
			</Animated.View>
		</Animated.View>
	)
});
CollectionHeader.displayName = "CollectionHeader";

export default CollectionHeader;