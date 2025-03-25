import * as React from 'react';
import Animated from 'react-native-reanimated';
import { useAuth } from '@/context/AuthProvider';
import { View } from 'react-native';
import { UserNav } from '@/components/user/UserNav';
import { ThemedSafeAreaView } from '@/components/ui/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import WidgetMostRecommended from '@/components/widgets/WidgetMostRecommended';
import tw from '@/lib/tw';
import { Button, ButtonText } from '@/components/ui/Button';
import { upperFirst } from 'lodash';
import { WidgetUserRecos } from '@/components/widgets/WidgetUserRecos';
import { WidgetUserWatchlist } from '@/components/widgets/WidgetUserWatchlist';
import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';
import { WidgetUserFriendsPlaylists } from '@/components/widgets/WidgetUserFriendsPlaylists';
import { WidgetUserFeed } from '@/components/widgets/WidgetUserFeed';
import { WidgetUserDiscovery } from '@/components/widgets/WidgetUserDiscovery';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const bottomTabHeight = useBottomTabOverflow();
  return (
      <ThemedSafeAreaView style={tw.style("flex-1")}>
        <View style={tw.style("flex-1 gap-2")}>
          <HomeHeader />
          <Animated.ScrollView
          contentContainerStyle={[
            tw`gap-2 px-2`,
            { paddingBottom: bottomTabHeight + 8 },
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          >
            <WidgetMostRecommended />
            {session ? (
              <>
              <WidgetUserRecos />
              <WidgetUserWatchlist />
              <WidgetUserFriendsPlaylists />
              <WidgetUserFeed />
              <WidgetUserDiscovery />
              </>
            ) : (
              <>
              <Link href="/auth/login" asChild>
                <Button>
                {upperFirst(t('common.messages.get_started_its_free'))}
                </Button>
              </Link>
              </>
            )}
          </Animated.ScrollView>
        </View>
      </ThemedSafeAreaView>
  );
}

const HomeHeader = () => {
  const { session, user } = useAuth();
  const { t } = useTranslation();
  return (
    <View style={tw.style('flex-row justify-between items-center px-2')}>
      <ThemedText numberOfLines={1} style={tw.style('text-2xl font-bold')}>
        {session
          ? `Welcome, ${user?.full_name}`
          : `Welcome on Recomend.`}
      </ThemedText>
      {session ? (
        <View style={tw.style('flex-row items-center gap-2')}>
          <UserNav />
        </View>
      ) : (
        <Link href={'/auth/login'} asChild><Button><ButtonText>{t('common.word.login')}</ButtonText></Button></Link>
      )}
    </View>
  );
};

export default HomeScreen;