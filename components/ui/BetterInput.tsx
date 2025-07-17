import * as React from "react"
import { Input } from "./Input"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { Pressable } from "react-native-gesture-handler"
import { useTheme } from "@/providers/ThemeProvider"
import tw from "@/lib/tw"
import { Icons } from "@/constants/Icons"

export interface InputProps extends React.ComponentProps<typeof TextInput> {
	clearable?: boolean;
	leftIcon?:  "search";
	leftIconStyle?: StyleProp<ViewStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const BetterInput = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	InputProps
>(({ style, value, clearable = true, containerStyle, leftIcon, leftIconStyle, onChangeText, ...props }, ref) => {
	const { colors } = useTheme();
	const getIcons = React.useCallback((name: string) => {
		switch (name) {
			case 'search':
				return <Icons.Search color={colors.mutedForeground} size={20} style={leftIconStyle} />;
			default:
				return null;
		}
	}, [colors.mutedForeground, leftIconStyle]);
	const icon = React.useMemo(() => {
		return leftIcon ? getIcons(leftIcon) : leftIcon;
	}, [leftIcon, getIcons]);
  	return (
		<View
		style={[
			{ backgroundColor: colors.muted },
			tw`flex-row items-center gap-2 rounded-md overflow-hidden px-2`,
			containerStyle,
		]}
		>
			{icon && icon}
			<Input
			ref={ref}
			style={[
				tw.style("flex-1 rounded-none px-0"),
				style,
			]}
			value={value}
			onChangeText={onChangeText}
			{...props}
			/>
			{(clearable && value && value?.length > 0) && (
			<Pressable
			onPress={() => {
				onChangeText?.('');
			}}
			>
				{/* <IconSymbol size={15} name="xmark" color={colors.foreground} style={{ opacity: 0.8 }} /> */}
				<Icons.Cancel color={colors.foreground} size={20} />
			</Pressable>
			)}
		</View>
	);
});
BetterInput.displayName = "BetterInput";

export { BetterInput };
