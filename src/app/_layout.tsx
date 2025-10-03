import { useRef, useState } from 'react';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { Providers } from '@/providers/Providers';
import Drawer from 'expo-router/drawer';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

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

export default RootLayout;