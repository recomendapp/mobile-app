import * as React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ScrollView, View } from 'react-native';
import { UserNav } from '@/components/user/UserNav';
import { ThemedSafeAreaView } from '@/components/ui/ThemedSafeAreaView';
import { Link, Stack } from 'expo-router';
import WidgetMostRecommended from '@/components/widgets/WidgetMostRecommended';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import { upperFirst } from 'lodash';
import { WidgetUserRecos } from '@/components/widgets/WidgetUserRecos';
import { WidgetUserWatchlist } from '@/components/widgets/WidgetUserWatchlist';
import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';
import { WidgetUserFriendsPlaylists } from '@/components/widgets/WidgetUserFriendsPlaylists';
import { WidgetUserFeed } from '@/components/widgets/WidgetUserFeed';
import { WidgetUserDiscovery } from '@/components/widgets/WidgetUserDiscovery';
import { useTranslations } from 'use-intl';
import Header from '@/components/header/Header';

const HomeScreen = () => {
  const t = useTranslations();
  const { session, user } = useAuth();
  const bottomTabHeight = useBottomTabOverflow();
  return (
    <>
      <ThemedSafeAreaView style={tw.style("flex-1")}>
        <View style={tw.style("flex-1 gap-2")}>
          <Header
          right={session ? `Welcome, ${user?.full_name}` : `Welcome on Recomend.`}
          left={<UserNav />}
          backButton={false}
          />
          <ScrollView
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
          </ScrollView>
        </View>
      </ThemedSafeAreaView>
    </>
  );
}

export default HomeScreen;