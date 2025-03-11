import * as React from 'react';
import Animated from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { View } from 'react-native';
import { UserNav } from '@/components/user/UserNav';
import { ThemedSafeAreaView } from '@/components/ui/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/tw';

const CollectionScreen = () => {
  const { session } = useAuth();
  return (
      <ThemedSafeAreaView style={[tw.style("flex-1")]}>
        <View className='flex-1 p-2 gap-2 '>
          <CollectionHeader />
          <Animated.ScrollView>
			      <ThemedText>Collection here</ThemedText>
          </Animated.ScrollView>
        </View>
      </ThemedSafeAreaView>
  );
}

const CollectionHeader = () => {
  const { session, user } = useAuth();
  const { t } = useTranslation();
  return (
    <View className='flex-row justify-between items-center'>
      <ThemedText className='text-2xl font-bold line-clamp-1'>
        {session
          ? `Welcome, ${user?.full_name}`
          : `Welcome on Recomend.`}
      </ThemedText>
      {session ? (
        <View className='flex-row items-center gap-2'>
          <UserNav />
        </View>
      ) : (
        <Button><Link href={'/auth/login'}>{t('common.word.login')}</Link></Button>
      )}
    </View>
  );
}


export default CollectionScreen;