import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import Colors, { TColors } from "@/constants/Colors";
import { DefaultTheme } from "@react-navigation/native";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

type ThemeContextType = {
	colors: TColors;
	applyColors: (colors: TColors) => void;
	inset: EdgeInsets;
	tabBarHeight: number;
	setTabBarHeight: (height: number) => void;
	bottomTabHeight: number;
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