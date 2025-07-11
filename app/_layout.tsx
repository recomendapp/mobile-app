import '~/lib/i18n';

import { SplashScreen } from 'expo-router';
import * as React from 'react';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { Providers } from '@/providers/Providers';
import Drawer from 'expo-router/drawer';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

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
          screenOptions={{
            drawerPosition: 'right',
            headerShown: false
          }}
          drawerContent={CustomDrawerContent}
        />
    </Providers>
  );
}