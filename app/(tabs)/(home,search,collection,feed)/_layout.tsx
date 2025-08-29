import { useAuth } from '@/providers/AuthProvider';
import { TabBarHeightUpdater, useTheme } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { upperFirst } from 'lodash';
import { Platform } from 'react-native';
import { useTranslations } from 'use-intl';

const AppLayout = ({ segment } : { segment: string }) => {
  const { colors, defaultScreenOptions } = useTheme();
  const t = useTranslations();
  const { session } = useAuth();
  return (
  <>
    <TabBarHeightUpdater />
    <Stack
    initialRouteName={
      segment === '(search)' ? 'search' :
      segment === '(feed)' ? 'feed' :
      segment === '(collection)' ? 'collection/(tabs)' :
      'index'
    }
    screenOptions={defaultScreenOptions}
    >
      {/* <Stack.Screen name="index" options={{ title: upperFirst(t('common.messages.home')) }} /> */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="feed" options={{ headerTitle: upperFirst(t('common.messages.feed')) }} />
      </Stack.Protected>
      {/* <Stack.Screen name="search/index" options={{ headerShown: false, headerTitle: upperFirst(t('common.messages.search')) }} /> */}
      {/* NOTIFICATIONS */}
      <Stack.Protected guard={!!session}>
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
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="film/[film_id]/review/create" options={{ headerTitle: upperFirst(t('common.messages.new_review')) }} />
        <Stack.Screen name="film/[film_id]/review/[review_id]/edit" options={{ headerTitle: upperFirst(t('common.messages.edit_review')) }} />
      </Stack.Protected>
      {/* TV SERIES */}
      <Stack.Screen name="tv-series/[tv_series_id]/review/[review_id]/index" options={{ headerTitle: upperFirst(t('common.messages.review', { count: 1 })) }} />
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
      <Stack.Screen name="upgrade" options={{ headerTitle: upperFirst(t('common.messages.upgrade')), presentation: 'modal' }} />
      
      {/* ABOUT */}
      <Stack.Screen name="about/index" options={{ headerTitle: upperFirst(t('common.messages.about')) }} />
    </Stack>
  </>
  );
};

export default AppLayout;