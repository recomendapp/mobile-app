import Colors, { TColors } from "@/constants/Colors";
import { DefaultTheme } from "@react-navigation/native";
import { createContext, useContext, useState } from "react";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

type ThemeContextType = {
	colors: TColors;
	applyColors: (colors: TColors) => void;
	inset: EdgeInsets;
};
  
const ThemeContext = createContext<ThemeContextType>({
	colors: Colors.dark,
	applyColors: () => {},
	inset: { top: 0, right: 0, bottom: 0, left: 0 },
});


type ThemeProviderProps = {
	children?: React.ReactNode;
};
  
const ThemeProvider = ({children}: ThemeProviderProps) => {
	const [colors, setColors] = useState(Colors.dark);
	const inset = useSafeAreaInsets();
	const applyColors = (colorTheme: TColors) => {
		setColors(colorTheme);
	};

	DefaultTheme.colors.background = colors.background;

	return (
		<ThemeContext.Provider
		value={{
			applyColors,
			colors,
			inset,
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
};