import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleProp, ViewStyle } from "react-native";
import { Button } from "./Button";
import { Icons } from "@/constants/Icons";
import { HeaderTitle } from '@react-navigation/elements';
import { useTheme } from "@/providers/ThemeProvider";

interface AnimatedStackScreenProps extends React.ComponentProps<typeof Stack.Screen> {
	scrollY: SharedValue<number>;
	triggerHeight: SharedValue<number>;
	onMenuPress?: () => void;
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
>(({ onMenuPress, scrollY, triggerHeight, ...props }, ref) => {
	const { colors } = useTheme();

	const defaultOptions = {
		headerTransparent: true,
	};

	const options = {
		...defaultOptions,
		...(typeof props.options === 'object' ? props.options : {}),
	};

	const headerTitle = typeof options.headerTitle === 'string' ? options.headerTitle : undefined;
	const headerBackgroundColor = getBackgroundColor(options.headerStyle);

	const titleAnimatedStyle = useAnimatedStyle(() => {
		const start = ((triggerHeight.value ?? 0) - 44) * 0.75;
		const end = (triggerHeight.value ?? 0) - 44 + 1;

		return {
			opacity: interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP),
			transform: [
			{
				scale: interpolate(scrollY.value, [start, end], [0.90, 1], Extrapolation.CLAMP),
			},
			{
				translateY: interpolate(scrollY.value, [start, end], [-10, 0], Extrapolation.CLAMP),
			},
			],
		};
	});
	const backgroundAnimatedStyle = useAnimatedStyle(() => {
		const start = ((triggerHeight.value ?? 0) - 44) * 0.75;
		const end = (triggerHeight.value ?? 0) - 44 + 1;

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
		headerStyle: [
			options.headerStyle,
			{ backgroundColor: 'transparent' },
		],
		headerBackground: () => (
			<Animated.View
			style={[
				StyleSheet.absoluteFillObject,
				{ backgroundColor: headerBackgroundColor || colors.background },
				backgroundAnimatedStyle,
			]}
			{...props}
			/>
		)
	}}
	/>
	);
});
AnimatedStackScreen.displayName = "AnimatedStackScreen";

export default AnimatedStackScreen;
  