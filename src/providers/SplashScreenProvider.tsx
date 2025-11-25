import { createContext, use, useEffect, useMemo, useState } from "react";
import { isAndroid, isIOS } from '@/platform/detection';
import * as SystemUI from 'expo-system-ui'
import * as ScreenOrientation from 'expo-screen-orientation'
import { logger } from '@/logger'
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync()
if (isIOS) {
	SystemUI.setBackgroundColorAsync('black')
}
if (isAndroid) {
	// iOS is handled by the config plugin -sfn
	ScreenOrientation.lockAsync(
		ScreenOrientation.OrientationLock.PORTRAIT_UP,
	).catch(error =>
		logger.debug('Could not lock orientation', {safeMessage: error}),
	)
}

type SplashScreenState = 'loading' | 'finished';

interface SplashScreenContextProps {
	auth: {
		ready: boolean;
		setReady: (ready: boolean) => void;
	},
	i18n: {
		ready: boolean;
		setReady: (ready: boolean) => void;
	},
	isReady: boolean;
	state: SplashScreenState;
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

	const isReady = useMemo(() => authReady && i18nReady, [authReady, i18nReady]);
	const [state, setState] = useState<SplashScreenState>('loading');

	useEffect(() => {
		if (isReady && state !== 'finished') {
			SplashScreen.hideAsync()
				.then(() => setState('finished'));
		}
	}, [isReady, state]);

	return (
		<SplashScreenContext.Provider
		value={{
			auth: {
				ready: authReady,
				setReady: setAuthReady
			},
			i18n: {
				ready: i18nReady,
				setReady: setI18nReady
			},
			isReady: isReady,
			state: state
		}}
		>
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