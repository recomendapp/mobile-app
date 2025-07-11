import * as React from 'react';
import Animated from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { FlatList, ScrollView, View } from 'react-native';
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
          <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={[
            tw`gap-2 px-2`,
            { paddingBottom: bottomTabHeight + 8 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
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
                    <ButtonText>{upperFirst(t('common.messages.get_started_its_free'))}</ButtonText>
                  </Button>
                </Link>
                </>
              )}
            </>
          }
          ListHeaderComponentStyle={tw`gap-2`}
          nestedScrollEnabled
          />
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
      ) : null}
    </View>
  );
};

export default HomeScreen;