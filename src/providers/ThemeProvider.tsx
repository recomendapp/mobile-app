import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import Colors, { TColors } from "@/constants/Colors";
import { useKeyboardToolbarOffset } from "@/hooks/useKeyboardToolbarOffset";
import { getModeFromColor } from "@/utils/getModeFromColor";
import { DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
	colors: TColors;
	applyColors: (colors: TColors) => void;
	tabBarHeight: number;
	setTabBarHeight: (height: number) => void;
	bottomOffset: number;
	defaultScreenOptions: React.ComponentProps<typeof Stack.Screen>['options'];
	mode: ThemeMode;
	keyboardOffset: number;
	setKeyboardToolbarOffset: (offset: number) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
	children?: React.ReactNode;
};
  
export const ThemeProvider = ({children}: ThemeProviderProps) => {
	const [colors, setColors] = useState(Colors.dark);
	const insets = useSafeAreaInsets();
	const [tabBarHeight, setTabBarHeight] = useState(0);
	const [keyboardOffset, setKeyboardToolbarOffset] = useState(0);

	const bottomOffset = useMemo(() => {
		return tabBarHeight + insets.bottom;
	}, [tabBarHeight, insets.bottom]);

	const defaultScreenOptions = useMemo((): React.ComponentProps<typeof Stack.Screen>['options'] => ({
		animation: 'ios_from_right',
		headerShown: true,
		headerTintColor: colors.foreground,
		headerStyle: {
			backgroundColor: colors.background,
		},
		headerShadowVisible: false,
		headerTitleAlign: 'center',
	}), [colors]);

	const applyColors = useCallback((colorTheme: TColors) => {
		setColors(colorTheme);
	}, []);

	const mode = useMemo((): ThemeMode => {
		return getModeFromColor(colors.background);
	}, [colors]);

	DefaultTheme.colors.background = colors.background;

	const contextValue = useMemo(() => ({
		applyColors,
		colors,
		tabBarHeight,
		setTabBarHeight,
		bottomOffset,
		defaultScreenOptions,
		mode,
		keyboardOffset,
		setKeyboardToolbarOffset,
	}), [applyColors, colors, tabBarHeight, setTabBarHeight, bottomOffset, defaultScreenOptions, mode, keyboardOffset, setKeyboardToolbarOffset]);

	return (
		<ThemeContext.Provider value={contextValue}>
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
		<KeyboardToolbarOffsetUpdater />
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

const KeyboardToolbarOffsetUpdater = () => {
	const keyboardOffset = useKeyboardToolbarOffset();
	const { setKeyboardToolbarOffset } = useTheme();
	useEffect(() => {
		setKeyboardToolbarOffset(keyboardOffset);
		return () => {
			setKeyboardToolbarOffset(0);
		}
	}, [keyboardOffset, setKeyboardToolbarOffset]);
	return null;
};