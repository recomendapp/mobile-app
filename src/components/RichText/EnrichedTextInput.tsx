import { useTheme } from "@/providers/ThemeProvider";
import { forwardRef } from "react";
import { EnrichedTextInput as EnrichedTextInputBase, EnrichedTextInputInstance, EnrichedTextInputProps } from "react-native-enriched";

const EnrichedTextInput = forwardRef<
	EnrichedTextInputInstance,
	EnrichedTextInputProps
>(({ style, htmlStyle, placeholderTextColor, ...props}, ref) => {
	const { colors } = useTheme();
	return (
		<EnrichedTextInputBase
		ref={ref as any}
		style={{
			color: colors.foreground,
			...style,
		}}
		htmlStyle={{
			...htmlStyle,
			a: {
				color: colors.accentPink,
				...htmlStyle?.a,
			},
		}}
		placeholderTextColor={placeholderTextColor || colors.mutedForeground}
		{...props}
		/>
	);
});
EnrichedTextInput.displayName = "EnrichedTextInput";

export { EnrichedTextInput };