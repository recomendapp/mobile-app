import '~/lib/i18n';

import { SplashScreen } from 'expo-router';
import * as React from 'react';
import { Platform } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
// import { Colors } from '@/constants/Colors';
import { Providers } from '@/context/Providers';
import Drawer from 'expo-router/drawer';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StatusBar from '@/components/StatusBar';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

// const LIGHT_THEME: Theme = {
//   ...DefaultTheme,
//   colors: Colors.light,
// };
// const DARK_THEME: Theme = {
//   ...DarkTheme,
//   colors: Colors.dark,
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  // const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    // if (Platform.OS === 'web') {
    //   // Adds the background color to the html element to prevent white background on overscroll.
    //   document.documentElement.classList.add('bg-background');
    // }
    setAndroidNavigationBar('dark');
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
    // SplashScreen.hide();
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <Providers>
      <StatusBar />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            drawerPosition: 'right',
            headerShown: false
          }}
          drawerContent={CustomDrawerContent}
        />
      </GestureHandlerRootView>
    </Providers>
  );
}