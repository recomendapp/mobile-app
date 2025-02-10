import * as React from 'react';
import Animated from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuth } from '@/context/AuthProvider';
import { ThemedView } from '@/components/ui/ThemedView';

const GITHUB_AVATAR_URI =
  'https://i.pinimg.com/originals/ef/a2/8d/efa28d18a04e7fa40ed49eeb0ab660db.jpg';

export default function HomScreen() {
  const { session, logout } = useAuth();
  return (
    <ThemedView className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
      <Animated.ScrollView>
        {/* <ThemedText>
          {JSON.stringify(session)}
        </ThemedText> */}
        {session ? <Button onPress={() => logout()}>
          <Text>Logout</Text>
        </Button> : null}
      </Animated.ScrollView>
    </ThemedView>
  );
}
