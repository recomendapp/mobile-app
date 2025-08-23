import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleProp, ViewStyle } from "react-native";
import { Button } from "./Button";
import { Icons } from "@/constants/Icons";
import { HeaderTitle, useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from "@/providers/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import Color from "color";
import { BlurView } from "expo-blur";

export interface AnimatedStackScreenProps extends React.ComponentProps<typeof Stack.Screen> {
	scrollY: SharedValue<number>;
	triggerHeight: SharedValue<number>;
	onMenuPress?: () => void;
	options: React.ComponentProps<typeof Stack.Screen>['options'] &{
		headerReplaceBackground?: boolean;
	}
	/**
	 * The ratio at which the animation should start.
	 * 0.0 = Start from first scroll position
	 * 0.8 = Start from 80% of the scroll position
	 * @default 0.25
	 */
	animationStartRatio?: number;
	/**
	 * The ratio at which the scale animation should start.
	 * 0.0 = Start from no scale
	 * 0.8 = Start from 80% of the scale
	 * @default 0.90
	 */
	scaleStartRatio?: number;
}

const ReanimatedHeaderTitle = Animated.createAnimatedComponent(HeaderTitle);


function getBackgroundColor(style: StyleProp<ViewStyle>) {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    for (const s of style) {
      if (s && typeof s === 'object' && 'backgroundColor' in s && typeof s.backgroundColor === 'string') {
        return s.backgroundColor;
      }
    }
    return undefined;
  }
  if (typeof style === 'object' && style !== null && 'backgroundColor' in style && typeof style.backgroundColor === 'string') {
    return style.backgroundColor;
  }
  return undefined;
}

const AnimatedStackScreen = React.forwardRef<
	React.ComponentRef<typeof Stack.Screen>,
	AnimatedStackScreenProps
>(({ onMenuPress, scrollY, triggerHeight, animationStartRatio = 0.25, scaleStartRatio = 0.90, ...props }, ref) => {
	const navigationHeaderHeight = useHeaderHeight();
	const { colors } = useTheme();

	const defaultOptions = {
		headerTransparent: true,
	};

	const { headerReplaceBackground, headerBackground, ...options } = {
		...defaultOptions,
		...(typeof props.options === 'object' ? props.options : {}),
	};

	const headerTitle = typeof options.headerTitle === 'string' ? options.headerTitle : undefined;
	const headerBackgroundColor = getBackgroundColor(options.headerStyle);

	const titleAnimatedStyle = useAnimatedStyle(() => {
		const animationDistance = triggerHeight.get() - navigationHeaderHeight;
		const start = animationDistance * animationStartRatio;
        const end = animationDistance;

		return {
			opacity: interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP),
			transform: [
			{
				scale: interpolate(scrollY.value, [start, end], [scaleStartRatio, 1], Extrapolation.CLAMP),
			},
			{
				translateY: interpolate(scrollY.value, [start, end], [-10, 0], Extrapolation.CLAMP),
			},
			],
		};
	});
	const backgroundAnimatedStyle = useAnimatedStyle(() => {
		const animationDistance = triggerHeight.get() - navigationHeaderHeight;
		const start = animationDistance * animationStartRatio;
        const end = animationDistance;

		return {
			opacity: interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP),
			transform: [
			{
				translateY: interpolate(scrollY.value, [start, end], [-10, 0], Extrapolation.CLAMP),
			},
			],
		};
	});

	return (
	<Stack.Screen
	{...props}
	options={{
		...onMenuPress ? {
			headerRight: () => (
				<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={onMenuPress}
				/>
			)
		} : {},
		headerStyle: [
			options.headerStyle,
			{ backgroundColor: 'transparent' },
		],
		headerBackground: () => (
		<>
			{!headerReplaceBackground && (
				<>
				<Animated.View
				style={[
					StyleSheet.absoluteFillObject,
					{ backgroundColor: headerBackgroundColor || 'transparent' },
					backgroundAnimatedStyle,
				]}
				>
					{!headerBackgroundColor && <BlurView style={StyleSheet.absoluteFill} tint="dark" intensity={100} />}
				</Animated.View>
				<LinearGradient
				colors={[
					Color.hsl(headerBackgroundColor || colors.background).alpha(0.8).string(),
					Color.hsl(headerBackgroundColor || colors.background).alpha(0.6).string(),
					'transparent'
				]}
				locations={[
					0,
					0.5,
					1
				]}
				style={StyleSheet.absoluteFill}
				/>
				</>
			)}
			{headerBackground?.()}
		</>
		),
		title: headerTitle,
		...options,
		headerTitle: (props) => (
			<ReanimatedHeaderTitle
			style={titleAnimatedStyle}
			tintColor={colors.foreground}
			{...props}
			>
				{headerTitle}
			</ReanimatedHeaderTitle>
		),
	}}
	/>
	);
});
AnimatedStackScreen.displayName = "AnimatedStackScreen";

export default AnimatedStackScreen;
  