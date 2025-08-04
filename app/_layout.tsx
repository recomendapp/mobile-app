import * as React from 'react';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { Providers } from '@/providers/Providers';
import Drawer from 'expo-router/drawer';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { Stack } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

const DrawerLayout = () => {
  const { session } = useAuth();
  if (!session) return (
    <Stack screenOptions={{ headerShown: false }} />
  );
  return (
    <Drawer
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false
      }}
      drawerContent={CustomDrawerContent}
    />
  );
};

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
        <DrawerLayout />
    </Providers>
  );
}