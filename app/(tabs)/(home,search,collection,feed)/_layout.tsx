import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationsProvider';
import { TabBarHeightUpdater, useTheme } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { upperFirst } from 'lodash';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useTranslations } from 'use-intl';

const AppLayout = ({ segment } : { segment: string }) => {
  const { defaultScreenOptions } = useTheme();
  const t = useTranslations();
  const { session } = useAuth();
  const { isMounted } = useNotifications();
  const initialRouteName = useMemo(() => {
    switch (segment) {
      case '(search)':
        return 'search';
      case '(feed)':
        return 'feed';
      case '(collection)':
        return 'collection/(tabs)';
      default:
        return 'index';
    }
  }, [segment]);
  return (
  <>
    <TabBarHeightUpdater />
    <Stack
    initialRouteName={initialRouteName}
    screenOptions={defaultScreenOptions}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="feed" options={{ headerTitle: upperFirst(t('common.messages.feed')) }} />
      </Stack.Protected>
      {/* NOTIFICATIONS */}
      <Stack.Protected guard={!!isMounted}>
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal", headerTitle: upperFirst(t('common.messages.notification', { count: 2 })) }} />
      </Stack.Protected>
      {/* COLLECTION */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="collection/(tabs)" />
        <Stack.Screen name="collection/heart-picks" options={{ headerTitle: upperFirst(t('common.messages.heart_pick', { count: 2 })) }} />
        <Stack.Screen name="collection/watchlist" options={{ headerTitle: upperFirst(t('common.messages.watchlist')) }} />
        <Stack.Screen name="collection/my-recos" options={{ headerTitle: upperFirst(t('common.messages.my_recos')) }} />
      </Stack.Protected>
      {/* MOVIES */}
      <Stack.Screen name="film/[film_id]/review/[review_id]/index" options={{ headerTitle: upperFirst(t('common.messages.review', { count: 1 })) }} />
      <Stack.Screen name="film/[film_id]/credits" options={{ headerTitle: upperFirst(t('common.messages.credits')) }} />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="film/[film_id]/review/create" options={{ headerTitle: upperFirst(t('common.messages.new_review')) }} />
        <Stack.Screen name="film/[film_id]/review/[review_id]/edit" options={{ headerTitle: upperFirst(t('common.messages.edit_review')) }} />
      </Stack.Protected>
      {/* TV SERIES */}
      <Stack.Screen name="tv-series/[tv_series_id]/review/[review_id]/index" options={{ headerTitle: upperFirst(t('common.messages.review', { count: 1 })) }} />
      <Stack.Screen name="tv-series/[tv_series_id]/credits" options={{ headerTitle: upperFirst(t('common.messages.credits')) }} />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="tv-series/[tv_series_id]/review/create" options={{ headerTitle: upperFirst(t('common.messages.new_review')) }} />
        <Stack.Screen name="tv-series/[tv_series_id]/review/[review_id]/edit" options={{ headerTitle: upperFirst(t('common.messages.edit_review')) }} />
      </Stack.Protected>
      {/* RECOS */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="reco/send/movie/[movie_id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="reco/send/tv-series/[tv_series_id]" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      {/* USERS */}
      {/* <Stack.Screen name="user/[username]/(follow)" options={{ presentation: 'modal', headerShown: false }} /> */}
      {/* SETTINGS */}
      <Stack.Screen name="settings/index" options={{ headerTitle: upperFirst(t('pages.settings.label')) }} />
      <Stack.Screen name="settings/appearance" options={{ headerTitle: upperFirst(t('pages.settings.appearance.label')) }} />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="settings/profile" options={{ headerTitle: upperFirst(t('pages.settings.profile.label')) }} />
        <Stack.Screen name="settings/account" options={{ headerTitle: upperFirst(t('pages.settings.account.label')) }} />
        <Stack.Screen name="settings/subscription" options={{ headerTitle: upperFirst(t('pages.settings.subscription.label')) }} />
        <Stack.Screen name="settings/security" options={{ headerTitle: upperFirst(t('pages.settings.security.label')) }} />
        <Stack.Screen name="settings/notifications" options={{ headerTitle: upperFirst(t('pages.settings.notifications.label')) }} />
      </Stack.Protected>
      {/* PLAYLIST */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="playlist/[playlist_id]/sort" options={{ presentation: 'modal' }} />
        {/* ADD */}
        <Stack.Screen name="playlist/add/movie/[movie_id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="playlist/add/tv-series/[tv_series_id]" options={{ presentation: 'modal' }} />
        <Stack.Screen
        name='playlist/[playlist_id]/edit'
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
        />
      </Stack.Protected>

      {/* SHARE */}
      <Stack.Screen name='share/film/[movie_id]' options={{ headerTitle: upperFirst(t('common.messages.share')), presentation: 'formSheet', gestureDirection: "vertical", animation: "slide_from_bottom", sheetGrabberVisible: true, sheetAllowedDetents: 'fitToContents' }} />

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
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="upgrade" options={{ presentation: 'fullScreenModal' }} />
      </Stack.Protected>
      {/* ABOUT */}
      <Stack.Screen name="about/index" options={{ headerTitle: upperFirst(t('common.messages.about')) }} />
    </Stack>
  </>
  );
};

export default AppLayout;