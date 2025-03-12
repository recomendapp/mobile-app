import Colors, { TColors } from "@/constants/Colors";
import { DefaultTheme } from "@react-navigation/native";
import { createContext, useContext, useState } from "react";

type ThemeContextType = {
	colors: TColors;
	applyColors: (colors: TColors) => void;
};
  
const ThemeContext = createContext<ThemeContextType>({
	colors: Colors.dark,
	applyColors: () => {},
});


type ThemeProviderProps = {
	children?: React.ReactNode;
};
  
const ThemeProvider = ({children}: ThemeProviderProps) => {
	const [colors, setColors] = useState(Colors.dark);

	const applyColors = (colorTheme: TColors) => {
		setColors(colorTheme);
	};

	DefaultTheme.colors.background = colors.background;

	return (
		<ThemeContext.Provider
		value={{
			applyColors,
			colors
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