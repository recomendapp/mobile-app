import { useAuth } from '@/providers/AuthProvider';
import { TabBarHeightUpdater, useTheme } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { upperFirst } from 'lodash';
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
      segment === '(search)' ? 'search/index' :
      segment === '(feed)' ? 'feed' :
      segment === '(collection)' ? 'collection/(tabs)' :
      'index'
    }
    screenOptions={defaultScreenOptions}
    >
      {/* <Stack.Screen name="index" options={{ title: upperFirst(t('common.messages.home')) }} /> */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="feed" options={{ headerShown: false, headerTitle: upperFirst(t('common.messages.feed')) }} />
      </Stack.Protected>
      <Stack.Screen name="search/index" options={{ headerShown: false, headerTitle: upperFirst(t('common.messages.search')) }} />
      {/* NOTIFICATIONS */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal", headerTitle: upperFirst(t('common.messages.notification', { count: 2 })) }} />
      </Stack.Protected>
      {/* REVIEWS */}
      <Stack.Screen name="review/[review_id]/index" options={{ headerTitle: upperFirst(t('common.messages.review', { count: 1 })) }} />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="review/create/[media_id]" options={{ headerTitle: upperFirst(t('common.messages.new_review')) }} />
        <Stack.Screen name="review/[review_id]/edit" options={{ headerTitle: upperFirst(t('common.messages.edit_review')) }} />
      </Stack.Protected>
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
        <Stack.Screen name="playlist/add/media/[media_id]" options={{ presentation: 'modal' }} />
        <Stack.Screen
        name='playlist/[playlist_id]/edit'
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
        />
      </Stack.Protected>
      {/* MEDIA */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="media/[media_id]/reco/send" options={{ presentation: 'modal' }} />
      </Stack.Protected>

      {/* AUTH */}
      <Stack.Protected guard={!session}>
        <Stack.Screen
        name='auth'
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
        />
      </Stack.Protected>
      <Stack.Screen name="upgrade" options={{ headerTitle: upperFirst(t('common.messages.upgrade')), presentation: 'modal' }} />
      <Stack.Screen
      name='modals/media/index'
      options={{
        presentation: 'formSheet',
        sheetAllowedDetents: [0.4, 1],
        sheetGrabberVisible: true,
      }}
      />
    </Stack>
  </>
  );
};

export default AppLayout;