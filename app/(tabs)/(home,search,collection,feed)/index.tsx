import * as React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ScrollView, StyleSheet } from 'react-native';
import { Link, Stack, useNavigation } from 'expo-router';
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
import { LinearGradient } from 'expo-linear-gradient';
import Color from 'color';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import AnimatedStackScreen from '@/components/ui/AnimatedStackScreen';

const HomeScreen = () => {
  const navigation = useNavigation();
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
            <Text style={tw`text-lg font-semibold`}>{upperFirst(t('common.messages.welcome_on_app', { app: app.name }))}</Text>
          )
        ),
        headerRight: () => (
          session ? (
            <UserNav />
          ) : (
            <Button
            variant="ghost"
            size="icon"
            icon={Icons.Menu}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          )
        ),
        headerBackground: () => (
          <LinearGradient
          colors={[
            Color.hsl(colors.background).alpha(0.8).string(),
            Color.hsl(colors.background).alpha(0.6).string(),
            'transparent'
          ]}
          locations={[
            0,
            0.5,
            1
          ]}
          style={StyleSheet.absoluteFill}
          />
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