import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';

const AppLayout = ({ segment } : { segment: string }) => {
  const { colors } = useTheme();
  const t = useTranslations();
  const { session } = useAuth();
  return (
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
      {/* REVIEW */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="review/create/[media_id]" options={{ headerTitle: upperFirst(t('common.messages.new_review')) }} />
      </Stack.Protected>
      {/* SETTINGS */}
      <Stack.Screen name="settings" options={{ headerTitle: upperFirst(t('pages.settings.label')) }} />

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
  );
};

export default AppLayout;