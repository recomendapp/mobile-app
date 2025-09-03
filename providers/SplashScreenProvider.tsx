import { SplashScreen } from "expo-router";
import { createContext, use, useEffect, useMemo, useState } from "react";

SplashScreen.preventAutoHideAsync();

interface SplashScreenContextProps {
  auth: {
	ready: boolean;
	setReady: (ready: boolean) => void;
  },
  i18n: {
	ready: boolean;
	setReady: (ready: boolean) => void;
  },
  ready: boolean;
}

const SplashScreenContext = createContext<SplashScreenContextProps | undefined>(undefined);

interface SplashScreenProviderProps {
	children?: React.ReactNode;
};

const SplashScreenProvider = ({
	children
} : SplashScreenProviderProps) => {
	const [authReady, setAuthReady] = useState(false);
	const [i18nReady, setI18nReady] = useState(false);

	const ready = useMemo(() => {
		const isAppReady = authReady && i18nReady;
		return isAppReady;
	}, [
		authReady,
		i18nReady
	]);

	useEffect(() => {
		if (ready) {
			SplashScreen.hide();
		}
	}, [ready]);

	return (
		<SplashScreenContext.Provider
		value={{
			auth: {
				ready: authReady, setReady: setAuthReady
			},
			i18n: {
				ready: i18nReady, setReady: setI18nReady
			},
			ready: ready
		}}>
			{children}
		</SplashScreenContext.Provider>
	);
};

const useSplashScreen = () => {
	const context = use(SplashScreenContext);
	if (!context) {
		throw new Error("useSplashScreen must be used within a SplashScreenProvider");
	}
	return context;
};

export {
	SplashScreenProvider,
	useSplashScreen
}