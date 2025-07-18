import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import * as React from "react";
import Animated from "react-native-reanimated";

interface IconMediaRatingProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "general" | "follower" | "user" | "profile";
		rating?: number | null;
}

const IconMediaRating = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	IconMediaRatingProps
>(({ rating, variant = "general", style, ...props }, ref) => {
	const { colors } = useTheme();
	const variantStyles = React.useMemo(() => {
		switch (variant) {
			case "follower":
				return {
					text: colors.accentBlue,
					border: colors.accentBlue,
				}
			case "user":
				return {
					text: colors.accentYellow,
					border: colors.accentYellow,
				}
			case "profile":
				return {
					text: colors.white,
					border: colors.muted,
				}
			default:
				return {
					text: colors.accentYellow,
					border: colors.accentYellow,
				}
		}
	}, [variant, colors]);
	if (!rating) return null;
	return (
	<Animated.View
	ref={ref}
	style={[
		{ aspectRatio: 3 / 2, backgroundColor:  colors.background, borderColor: variantStyles.border },
		tw.style('relative flex shadow-sm w-8 rounded-sm border-2 justify-center items-center shrink-0 font-bold text-sm'),
		style,
	]}
	{...props}
	>
		<Animated.Text style={[{ color: variantStyles.text }, tw`font-bold`]}>{rating % 1 === 0 ? rating : rating.toFixed(1)}</Animated.Text>
	</Animated.View>
	);
});
IconMediaRating.displayName = "IconMediaRating";

export {
	IconMediaRating,
}