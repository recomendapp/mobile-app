import { useRef, useState } from 'react';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { Providers } from '@/providers/Providers';
import Drawer from 'expo-router/drawer';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { SplashScreen } from 'expo-router';
import { isAndroid, isIOS } from '@/platform/detection';
import * as SystemUI from 'expo-system-ui'
import * as ScreenOrientation from 'expo-screen-orientation'
import { logger } from '@/logger'

export {
  ErrorBoundary,
} from 'expo-router';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

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

export default function RootLayout() {
  const hasMounted = useRef(false);
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  // Set the Android navigation bar color
  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }
    setAndroidNavigationBar('dark');
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <Providers>
      <StatusBar />
      <Drawer
      initialRouteName='(tabs)'
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false
      }}
      drawerContent={CustomDrawerContent}
      />
    </Providers>
  );
}