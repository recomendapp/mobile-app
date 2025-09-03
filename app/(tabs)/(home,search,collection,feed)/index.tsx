import { useAuth } from '@/providers/AuthProvider';
import { Link, useNavigation, useRouter } from 'expo-router';
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
import { DrawerActions, useScrollToTop } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import app from '@/constants/app';
import { UserNav } from '@/components/user/UserNav';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import AnimatedStackScreen from '@/components/ui/AnimatedStackScreen';
import { View } from '@/components/ui/view';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import { memo, useCallback, useMemo, useRef } from 'react';

const HeaderLeft = () => {
  const { session, user } = useAuth();
  const t = useTranslations();
  const now = useNow();

  const getTimeOfDay = useMemo((): string => {
    const hour = now.getHours();
    if (hour < 5) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }, [now]);

  if (session) {
    return user ? (
      <Text style={tw`text-lg font-semibold`}>
        {upperFirst(t('common.messages.greeting_with_name', { 
          timeOfDay: getTimeOfDay, 
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
HeaderLeft.displayName = 'HeaderLeft';

const HeaderRight = () => {
  const { session } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  const handleNotificationsPress = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const handleMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  return (
    <View style={tw`flex-row items-center gap-2`}>
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
HeaderRight.displayName = 'HeaderRight';

const AuthenticatedWidgets = memo(() => {
  const widgetStyles = {
    labelStyle: tw`px-4`,
    containerStyle: tw`px-4`
  };

  return (
    <>
      <WidgetUserRecos {...widgetStyles} />
      <WidgetUserWatchlist {...widgetStyles} />
      <WidgetUserFriendsPlaylists {...widgetStyles} />
      <WidgetUserDiscovery {...widgetStyles} />
    </>
  );
});
AuthenticatedWidgets.displayName = 'AuthenticatedWidgets';

const UnauthenticatedContent = memo(() => {
  const t = useTranslations();

  return (
    <Link href="/auth" asChild>
      <Button>
        {upperFirst(t('common.messages.get_started_its_free'))}
      </Button>
    </Link>
  );
});
UnauthenticatedContent.displayName = 'UnauthenticatedContent';

const HomeScreen = () => {
  const t = useTranslations();
  const { bottomTabHeight } = useTheme();
  const { session } = useAuth();

  // REFs
  const scrollRef = useRef<AnimatedScrollView>(null);
  // useSharedValues
  const scrollY = useSharedValue(0);
  const triggerHeight = useSharedValue(500);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  useScrollToTop(scrollRef);

  return (
    <>
      <AnimatedStackScreen
        scrollY={scrollY}
        triggerHeight={triggerHeight}
        options={{
          title: upperFirst(t('common.messages.home')),
          headerLeft: () => <HeaderLeft />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        contentContainerStyle={[
          tw`gap-2`,
          { paddingBottom: bottomTabHeight + 8 },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <WidgetMostRecommended />
        {session ? <AuthenticatedWidgets /> : <UnauthenticatedContent />}
      </Animated.ScrollView>
    </>
  );
};

export default HomeScreen;