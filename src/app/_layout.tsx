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
import { enableFreeze, enableScreens } from 'react-native-screens';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';
import { Platform } from 'react-native';
import { osName } from 'expo-device';

export {
  ErrorBoundary,
} from 'expo-router';

enableScreens(true);
enableFreeze(true);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

const RootLayoutNav = () => {
  const t = useTranslations();
  const { session } = useAuth();
  const { defaultScreenOptions, isLiquidGlassAvailable } = useTheme();
  return (
  <Stack
  initialRouteName='(tabs)'
  screenOptions={defaultScreenOptions}
  >
    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    {/* PLAYLISTS */}
    <Stack.Protected guard={!!session}>
      <Stack.Screen
      name="playlist/[playlist_id]/sort"
      options={{
        presentation: Platform.OS === "ios"
          ? isLiquidGlassAvailable && osName !== "iPadOS"
            ? "formSheet"
            : "modal"
          : "modal",
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.8],
        sheetInitialDetentIndex: 0,
        headerTransparent: true,
        ...(isLiquidGlassAvailable ? {
          contentStyle: { backgroundColor: 'transparent' },
          headerStyle: { backgroundColor: 'transparent' },
        } : {}),
      }}
      />
      <Stack.Screen
      name="playlist/add/movie/[movie_id]"
      options={{
        presentation: Platform.OS === "ios"
          ? isLiquidGlassAvailable && osName !== "iPadOS"
            ? "formSheet"
            : "modal"
          : "modal",
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.8],
        sheetInitialDetentIndex: 0,
        ...(isLiquidGlassAvailable ? {
          contentStyle: { backgroundColor: 'transparent' },
          headerStyle: { backgroundColor: 'transparent' },
        } : {}),
      }}
      />
      <Stack.Screen
      name="playlist/add/tv-series/[tv_series_id]"
      options={{
        presentation: Platform.OS === "ios"
          ? isLiquidGlassAvailable && osName !== "iPadOS"
            ? "formSheet"
            : "modal"
          : "modal",
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.8],
        sheetInitialDetentIndex: 0,
        ...(isLiquidGlassAvailable ? {
          contentStyle: { backgroundColor: 'transparent' },
          headerStyle: { backgroundColor: 'transparent' },
        } : {}),
      }}
      />
      <Stack.Screen name='playlist/[playlist_id]/edit' options={{ headerShown: false, presentation: 'modal' }} />
    </Stack.Protected>
    {/* RECOS */}
    <Stack.Protected guard={!!session}>
      <Stack.Screen
      name="reco/send/movie/[movie_id]"
      options={{
        presentation: Platform.OS === "ios"
          ? isLiquidGlassAvailable && osName !== "iPadOS"
            ? "formSheet"
            : "modal"
          : "modal",
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.8],
        sheetInitialDetentIndex: 0,
        ...(isLiquidGlassAvailable ? {
          contentStyle: { backgroundColor: 'transparent' },
          headerStyle: { backgroundColor: 'transparent' },
        } : {}),
      }}
      />
      <Stack.Screen
      name="reco/send/tv-series/[tv_series_id]"
      options={{
        presentation: Platform.OS === "ios"
          ? isLiquidGlassAvailable && osName !== "iPadOS"
            ? "formSheet"
            : "modal"
          : "modal",
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.8],
        sheetInitialDetentIndex: 0,
        ...(isLiquidGlassAvailable ? {
          contentStyle: { backgroundColor: 'transparent' },
          headerStyle: { backgroundColor: 'transparent' },
        } : {}),
      }}
      />
    </Stack.Protected>
    {/* AUTH */}
    <Stack.Protected guard={!session}>
      <Stack.Screen
      name='auth'
      options={{
        headerShown: false,
        presentation: Platform.select({
          ios: 'modal',
          android: 'formSheet',
          default: 'modal',
        })
      }} />
    </Stack.Protected>

    <Stack.Screen name="explore" options={{ title: upperFirst(t('common.messages.explore')), headerTitle: () => <></>, headerTransparent: true, headerStyle: { backgroundColor: 'transparent' } }} />
    <Stack.Screen name="upgrade" options={{ presentation: 'fullScreenModal' }} />
    <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_bottom', animationDuration: 250 }} />
  </Stack>
  );
};

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
      <RootLayoutNav />
    </Providers>
  );
};

export default Sentry.wrap(RootLayout);