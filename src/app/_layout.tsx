// Sentry
import '@/logger/sentry/setup';
import { Sentry } from '@/logger/sentry/lib'

import { useEffect, useRef, useState } from 'react';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { Providers } from '@/providers/Providers';
import Drawer from 'expo-router/drawer';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { startAppCheck } from '@/lib/firebase/appCheck';

export {
  ErrorBoundary,
} from 'expo-router';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

const RootLayout = () => {
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

  useEffect(() => {
    startAppCheck();
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

export default Sentry.wrap(RootLayout);