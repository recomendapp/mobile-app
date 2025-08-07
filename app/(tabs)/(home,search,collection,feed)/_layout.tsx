import { useAuth } from '@/providers/AuthProvider';
import { TabBarHeightUpdater, useTheme } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';

const AppLayout = ({ segment } : { segment: string }) => {
  const { colors } = useTheme();
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
    screenOptions={{
      animation: 'ios_from_right',
      headerShown: true,
      headerTintColor: colors.foreground,
      headerStyle: {
        backgroundColor: colors.background,
      },
    }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, headerTitle: upperFirst(t('common.messages.home')) }} />
      <Stack.Screen name="feed" options={{ headerShown: false, headerTitle: upperFirst(t('common.messages.feed')) }} />
      <Stack.Screen name="search/index" options={{ headerShown: false, headerTitle: upperFirst(t('common.messages.search')) }} />
      {/* LOGIN ONLY */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="review/create/[media_id]" options={{ headerTitle: upperFirst(t('common.messages.new_review')) }} />
        {/* SETTINGS */}
        <Stack.Screen name="settings/index" options={{ headerTitle: upperFirst(t('pages.settings.label')) }} />
        <Stack.Screen name="settings/profile" options={{ headerTitle: upperFirst(t('pages.settings.profile.label')) }} />
        <Stack.Screen name="settings/account" options={{ headerTitle: upperFirst(t('pages.settings.account.label')) }} />
        <Stack.Screen name="settings/subscription" options={{ headerTitle: upperFirst(t('pages.settings.subscription.label')) }} />
        <Stack.Screen name="settings/security" options={{ headerTitle: upperFirst(t('pages.settings.security.label')) }} />
        <Stack.Screen name="settings/notifications" options={{ headerTitle: upperFirst(t('pages.settings.notifications.label')) }} />
        <Stack.Screen name="settings/appearance" options={{ headerTitle: upperFirst(t('pages.settings.appearance.label')) }} />
      </Stack.Protected>

      {/* MODALS */}
      <Stack.Protected guard={!session}>
        <Stack.Screen
        name='auth'
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
        />
      </Stack.Protected>
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