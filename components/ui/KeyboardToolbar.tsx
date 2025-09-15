import { useTheme } from "@/providers/ThemeProvider";
import { DefaultKeyboardToolbarTheme, KeyboardToolbar as RNKeyboardToolbar } from "react-native-keyboard-controller";
import { KeyboardToolbarTheme } from "react-native-keyboard-controller/lib/typescript/components/KeyboardToolbar/types";

interface KeyboardToolbarProps extends React.ComponentPropsWithoutRef<typeof RNKeyboardToolbar> {}

export const KeyboardToolbar = ({
	theme,
	...props
}: KeyboardToolbarProps) => {
	const { colors } = useTheme();
	const themeDefault: KeyboardToolbarTheme = {
		...DefaultKeyboardToolbarTheme,
		dark: {
			...DefaultKeyboardToolbarTheme.dark,
			background: colors.muted,
			primary: colors.foreground,
			
		},
		light: {
			...DefaultKeyboardToolbarTheme.light,
			background: colors.muted,
			primary: colors.foreground,
		},
		...theme,
	}
	return <RNKeyboardToolbar theme={themeDefault} {...props} />;
};
