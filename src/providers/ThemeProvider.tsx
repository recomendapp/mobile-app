import Colors, { TColors } from "@/constants/Colors";
import { DarkTheme, ThemeProvider as NativeThemeProvider } from "@react-navigation/native";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { setBackgroundColorAsync } from "expo-system-ui";
import { Appearance, Platform } from "react-native";
import { isLiquidGlassAvailable as utilsIsLiquidGlassAvailable } from "expo-glass-effect";
import { setButtonStyleAsync } from "expo-navigation-bar";
import { getModeFromColor } from "@/utils/getModeFromColor";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
	colors: TColors;
	applyColors: (theme: keyof typeof Colors) => void;
	bottomOffset: number;
	defaultScreenOptions: NativeStackNavigationOptions;
	mode: ThemeMode;
	isLiquidGlassAvailable: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
	children?: React.ReactNode;
};
  
export const ThemeProvider = ({children}: ThemeProviderProps) => {
	const insets = useSafeAreaInsets();
	const isLiquidGlassAvailable = utilsIsLiquidGlassAvailable()
	const [colors, setColors] = useState(Colors['dark']);
	const mode = useMemo((): ThemeMode => getModeFromColor(colors.background), [colors.background]);
	const applyColors = useCallback((theme: keyof typeof Colors) => {
		setColors(Colors[theme]);
	}, []);

	const tabBarHeight = Platform.select({
		android: 79,
		web: 0,
		default: 80,
	});
	const bottomOffset = useMemo(() => (
		Platform.OS === 'android' ? tabBarHeight + insets.bottom : 0
	), [insets.bottom, tabBarHeight]);

	const defaultScreenOptions = useMemo<NativeStackNavigationOptions>(() => ({
		animation: 'ios_from_right',
		headerShown: true,
		headerTintColor: colors.foreground,
		headerStyle: {
			backgroundColor: colors.background,
			// backgroundColor: isLiquidGlassAvailable ? 'transparent' : colors.background,
		},
		contentStyle: {
			backgroundColor: colors.background,
			// backgroundColor: isLiquidGlassAvailable ? 'transparent' : colors.background,
		},
		headerShadowVisible: false,
		headerTitleAlign: 'center',
		headerBackButtonDisplayMode: 'minimal',
	}), [colors]);

	useEffect(() => {
		Appearance.setColorScheme(mode);
		if (Platform.OS === "android") {
			setButtonStyleAsync(mode);
		}
	}, [mode]);

	useEffect(() => {
		setBackgroundColorAsync(colors.background);
	}, [colors]);

	return (
	<NativeThemeProvider
	value={{
		dark: mode === 'dark',
		colors: {
			...DarkTheme.colors,
			primary: colors.primary,
			background: colors.background,
			card: colors.muted,
			text: colors.foreground,
			border: colors.border,
			notification: colors.accentYellow,
		},
		fonts: DarkTheme.fonts,
	}}
	>
		<ThemeContext.Provider
		value={{
			applyColors,
			colors,
			bottomOffset,
			defaultScreenOptions,
			mode,
			isLiquidGlassAvailable,
		}}
		>
			{children}
		</ThemeContext.Provider>
	</NativeThemeProvider>
	);
};

export const useTheme = () => {
	const context = use(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};