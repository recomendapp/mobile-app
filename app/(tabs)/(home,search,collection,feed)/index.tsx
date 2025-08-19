import * as React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Link, useNavigation, useRouter } from 'expo-router';
import WidgetMostRecommended from '@/components/widgets/WidgetMostRecommended';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import { upperFirst } from 'lodash';
import { WidgetUserRecos } from '@/components/widgets/WidgetUserRecos';
import { WidgetUserWatchlist } from '@/components/widgets/WidgetUserWatchlist';
import { WidgetUserFriendsPlaylists } from '@/components/widgets/WidgetUserFriendsPlaylists';
import { WidgetUserFeed } from '@/components/widgets/WidgetUserFeed';
import { WidgetUserDiscovery } from '@/components/widgets/WidgetUserDiscovery';
import { useNow, useTranslations } from 'use-intl';
import { useTheme } from '@/providers/ThemeProvider';
import { Icons } from '@/constants/Icons';
import { DrawerActions } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import app from '@/constants/app';
import { UserNav } from '@/components/user/UserNav';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import AnimatedStackScreen from '@/components/ui/AnimatedStackScreen';
import { View } from '@/components/ui/view';

const HomeScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const t = useTranslations();
  const { session, user } = useAuth();
  const { bottomTabHeight, colors } = useTheme();
  const now = useNow();
  // SharedValues
  const scrollY = useSharedValue(0);
  const triggerHeight = useSharedValue(500);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const getTimeOfDay = React.useMemo((): string => {
    const hour = now.getHours();
    if (hour < 5) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }, [now]);

  return (
    <>
      <AnimatedStackScreen
      scrollY={scrollY}
      triggerHeight={triggerHeight}
      options={{
        title: upperFirst(t('common.messages.home')),
        headerLeft: () => (
          session ? (
            user ? <Text style={tw`text-lg font-semibold`}>{upperFirst(t('common.messages.greeting_with_name', { timeOfDay: getTimeOfDay, name: user?.full_name! }))}</Text> : <Skeleton style={tw`w-28 h-6`} />
          ) : (
            <Text style={tw`text-lg font-semibold`}>{upperFirst(t('common.messages.welcome_to_app', { app: app.name }))}</Text>
          )
        ),
        headerRight: () => (
          <View style={tw`flex-row items-center gap-2`}>
          {session ? (
            <>
              <Button
              variant='ghost'
              icon={Icons.Bell}
              size='icon'
              onPress={() => router.push('/notifications')}
              />
              <UserNav />
            </>
          ) : (
            <Button
            variant="ghost"
            size="icon"
            icon={Icons.Menu}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          )}
          </View>
        )
      }}
      />
      <Animated.ScrollView
      onScroll={scrollHandler}
      contentContainerStyle={[
        tw`gap-2`,
        { paddingBottom: bottomTabHeight + 8 },
      ]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      >
        <WidgetMostRecommended />
        {session ? (
          <>
          <WidgetUserRecos labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
          <WidgetUserWatchlist labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
          <WidgetUserFriendsPlaylists labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
          <WidgetUserFeed labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
          <WidgetUserDiscovery labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
          </>
        ) : (
          <>
          <Link href="/auth" asChild>
            <Button>{upperFirst(t('common.messages.get_started_its_free'))}</Button>
          </Link>
          </>
        )}
      </Animated.ScrollView>
    </>
  );
};

export default HomeScreen;