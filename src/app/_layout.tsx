// Sentry
import '@/logger/sentry/setup';
import { Sentry } from '@/logger/sentry/lib'

import { useRef, useState } from 'react';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { Providers } from '@/providers/Providers';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { Stack } from 'expo-router';

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

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <Providers>
      <StatusBar />
      <Stack initialRouteName='(tabs)' screenOptions={{ headerShown: false }} />
    </Providers>
  );
}

export default Sentry.wrap(RootLayout);