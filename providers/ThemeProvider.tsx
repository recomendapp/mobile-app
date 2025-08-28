import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import Colors, { TColors } from "@/constants/Colors";
import { DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
	const applyColors = (colorTheme: TColors) => {
		setColors(colorTheme);
	};
	const inset = useSafeAreaInsets();
	const [tabBarHeight, setTabBarHeight] = useState(0);

	const bottomTabHeight = useMemo(() => {
		return tabBarHeight + inset.bottom;
	}, [tabBarHeight, inset.bottom]);

	const defaultScreenOptions: React.ComponentProps<typeof Stack.Screen>['options'] = {
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
	};

	DefaultTheme.colors.background = colors.background;

	return (
		<ThemeContext.Provider
		value={{
			applyColors,
			colors,
			inset,
			tabBarHeight,
			setTabBarHeight,
			bottomTabHeight,
			defaultScreenOptions,
		}}
		>
			{children}
		</ThemeContext.Provider>
	);
};

const useTheme = () => {
	const context = useContext(ThemeContext);
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