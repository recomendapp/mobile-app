import { useBottomTabOverflow } from '@/components/TabBarBackground';
import { Button, buttonTextVariants } from '@/components/ui/button';
import { ThemedSafeAreaView } from '@/components/ui/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';

export default function NotFoundScreen() {
  const tabBarHeight = useBottomTabOverflow();
  const navigation = useNavigation();
  return (
      <ThemedSafeAreaView
      className='flex-1 justify-center items-center gap-2'
      style={[
        { paddingBottom: tabBarHeight },
      ]}
      >
        <ThemedText className='text-3xl font-bold'>This screen doesn't exist.</ThemedText>

        <Button onPress={() => navigation.goBack()}>
          <Text className={buttonTextVariants({ variant: 'default' })}>Go back !</Text>
        </Button>
      </ThemedSafeAreaView>
  );
}
