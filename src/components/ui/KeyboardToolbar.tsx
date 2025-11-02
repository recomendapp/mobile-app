import { useTheme } from "@/providers/ThemeProvider";
import { useMemo } from "react";
import { DefaultKeyboardToolbarTheme, KeyboardToolbar as RNKeyboardToolbar } from "react-native-keyboard-controller";
import { KeyboardToolbarTheme } from "react-native-keyboard-controller/lib/typescript/components/KeyboardToolbar/types";

interface KeyboardToolbarProps extends React.ComponentPropsWithoutRef<typeof RNKeyboardToolbar> {}

export const KeyboardToolbar = ({
	theme,
	offset: offsetProps,
	...props
}: KeyboardToolbarProps) => {
	const { colors, keyboardOffset } = useTheme();
	const offset = {
		opened: keyboardOffset,
		...offsetProps,
	};
	const themeDefault: KeyboardToolbarTheme = useMemo(() => ({
		...DefaultKeyboardToolbarTheme,
		dark: {
			...DefaultKeyboardToolbarTheme.dark,
			background: colors.keyboardToolbarBackground,
			primary: colors.foreground,
		},
		light: {
			...DefaultKeyboardToolbarTheme.light,
			background: colors.keyboardToolbarBackground,
			primary: colors.foreground,
		},
		...theme,
	}), [colors, theme]);
	return <RNKeyboardToolbar offset={offset} theme={themeDefault} {...props} />;
};
