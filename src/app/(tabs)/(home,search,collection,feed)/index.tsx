import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import WidgetMostRecommended from '@/components/widgets/WidgetMostRecommended';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import { upperFirst } from 'lodash';
import { WidgetUserRecos } from '@/components/widgets/WidgetUserRecos';
import { WidgetUserWatchlist } from '@/components/widgets/WidgetUserWatchlist';
import { WidgetUserFriendsPlaylists } from '@/components/widgets/WidgetUserFriendsPlaylists';
import { WidgetUserDiscovery } from '@/components/widgets/WidgetUserDiscovery';
import { useNow, useTranslations } from 'use-intl';
import { useTheme } from '@/providers/ThemeProvider';
import { Icons } from '@/constants/Icons';
import { useScrollToTop } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import app from '@/constants/app';
import { UserNav } from '@/components/user/UserNav';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import AnimatedStackScreen from '@/components/ui/AnimatedStackScreen';
import { View } from '@/components/ui/view';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import { useRef, useState } from 'react';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Pressable, RefreshControl } from 'react-native';
import { WidgetMostPopular } from '@/components/widgets/WidgetMostPopular';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackHeaderItem } from '@react-navigation/native-stack';
import UserAvatar from '@/components/user/UserAvatar';
import { widgetKeys } from '@/api/widgets/widgetKeys';
import { userKeys } from '@/api/users/userKeys';

const HeaderLeft = () => {
  const { session, user } = useAuth();
  const t = useTranslations();
  const now = useNow();

  const hour = now.getHours();
  const timeOfDay =
    hour < 5 ? 'night' :
    hour < 12 ? 'morning' :
    hour < 18 ? 'afternoon' :
    'evening';

  if (session) {
    return user ? (
      <Text style={tw`text-lg font-semibold`}>
        {upperFirst(t('common.messages.greeting_with_name', { 
          timeOfDay: timeOfDay, 
          name: user.full_name 
        }))}
      </Text>
    ) : (
      <Skeleton style={tw`w-28 h-6`} />
    );
  }

  return (
    <Text style={tw`text-lg font-semibold`}>
      {upperFirst(t('common.messages.welcome_to_app', { app: app.name }))}
    </Text>
  );
};

const HeaderRight = () => {
  const { session } = useAuth();
  const router = useRouter();

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  const handleMenuPress = () => {
    router.push({ pathname: '/settings' });
  };

  return (
    <View style={tw`flex-row items-center gap-2`}>
      <Button
        variant='ghost'
        icon={Icons.Explore}
        size='icon'
        onPress={() => router.push('/explore')}
      />
      {session ? (
        <>
          <Button
            variant='ghost'
            icon={Icons.Bell}
            size='icon'
            onPress={handleNotificationsPress}
          />
          <UserNav />
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          icon={Icons.Menu}
          onPress={handleMenuPress}
        />
      )}
    </View>
  );
};

const AuthenticatedWidgets = () => {
  return (
    <>
      <WidgetUserRecos labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
      <WidgetUserWatchlist labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
      <WidgetUserFriendsPlaylists labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
      <WidgetUserDiscovery labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
    </>
  );
};

const UnauthenticatedContent = () => {
  return null;
};

const HomeScreen = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { bottomOffset, tabBarHeight } = useTheme();
  const { session, user } = useAuth();
  const navigationHeaderHeight = useHeaderHeight();
  // States
  const [isRefetching, setIsRefetching] = useState(false);
  // REFs
  const scrollRef = useRef<AnimatedScrollView>(null);
  // useSharedValues
  const scrollY = useSharedValue(0);
  const triggerHeight = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const refetch = async () => {
    setIsRefetching(true);
    try {
      queryClient.invalidateQueries({ queryKey: widgetKeys.mostRecommended() }); // WidgetMostRecommended
      queryClient.invalidateQueries({ queryKey: widgetKeys.mostPopular() }); // WidgetMostPopular
      if (session?.user.id) {
        queryClient.invalidateQueries({ queryKey: userKeys.recos({ userId: session.user.id, type: 'all' })}); // WidgetUserRecos
        queryClient.invalidateQueries({ queryKey: userKeys.watchlist({ userId: session.user.id, type: 'all' })}); // WidgetUserWatchlist
        queryClient.invalidateQueries({ queryKey: userKeys.playlistsFriends({ userId: session.user.id })}); // WidgetUserFriendsPlaylists
        queryClient.invalidateQueries({ queryKey: widgetKeys.users({ filters: { sortBy: 'created_at', sortOrder: 'desc' }})}); // WidgetUserDiscovery
      }
    } finally {
      setIsRefetching(false);
    }
  };

  useScrollToTop(scrollRef);

  return (
    <>
      <AnimatedStackScreen
        scrollY={scrollY}
        triggerHeight={triggerHeight}
        options={{
          title: upperFirst(t('common.messages.home')),
          headerTitle: () => <></>,
          headerLeft: () => <HeaderLeft />,
          headerRight: () => <HeaderRight />,
          unstable_headerRightItems: (props) => [
            {
              type: 'button',
              label: upperFirst(t('common.messages.explore')),
              onPress: () => router.push('/explore'),
              icon: {
                name: 'map',
                type: 'sfSymbol',
              },
            },
            ...(session ? [
              {
                type: "button",
                label: upperFirst(t('common.messages.notification', { count: 2 })),
                onPress: () => router.push('/notifications'),
                icon: {
                  name: "bell",
                  type: "sfSymbol",
                },
              },
              {
                type: "custom",
                element: (
                  <Pressable onPress={() => router.push(`/user/${user?.username}`)} disabled={!user}>
                    {user ? <UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} style={{ width: 36, height: 36 }} /> : <UserAvatar skeleton style={{ width: 36, height: 36 }} />}
                  </Pressable>
                ),
              },
            ] satisfies NativeStackHeaderItem[] : [
              {
                type: "menu",
                variant: "plain",
                icon: {
                  name: "ellipsis",
                  type: "sfSymbol",
                },
                label: "Options",
                menu: {
                  items: [
                    {
                      type: "action",
                      label: upperFirst(t('common.messages.login')),
                      onPress: () => router.push('/auth/login'),
                      icon: {
                        name: "person.crop.circle",
                        type: "sfSymbol",
                      },
                    },
                    {
                      type: "action",
                      label: upperFirst(t('common.messages.setting', { count: 2})),
                      onPress: () => router.push('/settings'),
                      icon: {
                        name: "gear",
                        type: "sfSymbol",
                      },
                    },
                  ],
                },
              },
            ] satisfies NativeStackHeaderItem[]),
          ],
        }}
      />
      <Animated.ScrollView
      ref={scrollRef}
      onScroll={scrollHandler}
      contentContainerStyle={{
        gap: GAP,
        paddingBottom: bottomOffset + PADDING_VERTICAL,
      }}
      scrollIndicatorInsets={{
        bottom: tabBarHeight
      }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      nestedScrollEnabled
      >
        <WidgetMostRecommended
        scrollY={scrollY}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          triggerHeight.value = (height - navigationHeaderHeight) * 0.7;
        }}
        />
        <WidgetMostPopular labelStyle={{paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
        {session ? (
          <AuthenticatedWidgets />
        ) : (
          <UnauthenticatedContent />
        )}
      </Animated.ScrollView>
    </>
  );
};

export default HomeScreen;