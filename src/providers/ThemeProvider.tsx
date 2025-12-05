import Colors, { TColors } from "@/constants/Colors";
import { getModeFromColor } from "@/utils/getModeFromColor";
import { DefaultTheme } from "@react-navigation/native";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useBottomTabOverflow } from "@/hooks/useBottomTabOverflow";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
	colors: TColors;
	applyColors: (colors: TColors) => void;
	tabBarHeight: number;
	setTabBarHeight: (height: number) => void;
	bottomOffset: number;
	defaultScreenOptions: NativeStackNavigationOptions;
	mode: ThemeMode;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
	children?: React.ReactNode;
};
  
export const ThemeProvider = ({children}: ThemeProviderProps) => {
	const [colors, setColors] = useState(Colors.dark);
	const insets = useSafeAreaInsets();
	const [tabBarHeight, setTabBarHeight] = useState(0);

	const bottomOffset = useMemo(() => tabBarHeight + insets.bottom, [tabBarHeight, insets.bottom]);

	const defaultScreenOptions: NativeStackNavigationOptions = {
		animation: 'ios_from_right',
		headerShown: true,
		headerTintColor: colors.foreground,
		headerStyle: {
			backgroundColor: colors.background,
		},
		headerShadowVisible: false,
		headerTitleAlign: 'center',
	};

	const applyColors = useCallback((colorTheme: TColors) => {
		setColors(colorTheme);
	}, []);

	const mode = useMemo((): ThemeMode => getModeFromColor(colors.background), [colors.background]);

	useEffect(() => {
		DefaultTheme.colors.background = colors.background;
	}, [colors]);

	return (
		<ThemeContext.Provider
		value={{
			applyColors,
			colors,
			tabBarHeight,
			setTabBarHeight,
			bottomOffset,
			defaultScreenOptions,
			mode,
		}}
		>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = use(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

/* ---------------------------------- UTILS --------------------------------- */
export const ThemeUpdater = () => {
	return (
	<>
		<TabBarHeightUpdater />
	</>
	);
};

const TabBarHeightUpdater = () => {
	const tabBarHeight = useBottomTabOverflow();
	const { setTabBarHeight } = useTheme();
	useEffect(() => {
		setTabBarHeight(tabBarHeight);
		return () => {
			setTabBarHeight(0);
		}
	}, [tabBarHeight, setTabBarHeight]);
	return null;
};