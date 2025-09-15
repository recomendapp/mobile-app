import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import Colors, { TColors } from "@/constants/Colors";
import { DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

type ThemeContextType = {
	colors: TColors;
	applyColors: (colors: TColors) => void;
	inset: EdgeInsets;
	tabBarHeight: number;
	setTabBarHeight: (height: number) => void;
	bottomTabHeight: number;
	defaultScreenOptions: React.ComponentProps<typeof Stack.Screen>['options'];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
	children?: React.ReactNode;
};
  
const ThemeProvider = ({children}: ThemeProviderProps) => {
	const [colors, setColors] = useState(Colors.dark);
	const inset = useSafeAreaInsets();
	const [tabBarHeight, setTabBarHeight] = useState(0);

	const bottomTabHeight = useMemo(() => {
		return tabBarHeight + inset.bottom;
	}, [tabBarHeight, inset.bottom]);

	const defaultScreenOptions = useMemo((): React.ComponentProps<typeof Stack.Screen>['options'] => ({
		animation: 'ios_from_right',
		headerShown: true,
		headerTintColor: colors.foreground,
		headerStyle: {
			backgroundColor: colors.background,
		},
		headerShadowVisible: false,
		headerTitleAlign: 'center',
		gestureEnabled: true,
		gestureDirection: "vertical",
	}), [colors]);

	const applyColors = useCallback((colorTheme: TColors) => {
		setColors(colorTheme);
	}, []);

	DefaultTheme.colors.background = colors.background;

	const contextValue = useMemo(() => ({
		applyColors,
		colors,
		inset,
		tabBarHeight,
		setTabBarHeight,
		bottomTabHeight,
		defaultScreenOptions,
	}), [applyColors, colors, inset, tabBarHeight, setTabBarHeight, bottomTabHeight, defaultScreenOptions]);

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
};

const useTheme = () => {
	const context = use(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

export {
	ThemeProvider,
	useTheme,
	TabBarHeightUpdater,
};

/* ---------------------------------- UTILS --------------------------------- */
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