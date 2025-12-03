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
import { useNotifications } from '@/providers/NotificationsProvider';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';
import { Platform } from 'react-native';

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
  const { defaultScreenOptions } = useTheme();
  const { isMounted } = useNotifications();
  return (
  <Stack initialRouteName='(tabs)' screenOptions={defaultScreenOptions}>
    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    {/* PLAYLISTS */}
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="playlist/[playlist_id]/sort" options={{ presentation: 'modal' }} />
      <Stack.Screen name="playlist/add/movie/[movie_id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="playlist/add/tv-series/[tv_series_id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name='playlist/[playlist_id]/edit' options={{ headerShown: false, presentation: 'modal' }} />
    </Stack.Protected>
    {/* RECOS */}
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="reco/send/movie/[movie_id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reco/send/tv-series/[tv_series_id]" options={{ presentation: 'modal' }} />
    </Stack.Protected>
    {/* NOTIFICATIONS */}
    <Stack.Protected guard={!!isMounted}>
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'modal', headerTitle: upperFirst(t('common.messages.notification', { count: 2 })) }} />
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