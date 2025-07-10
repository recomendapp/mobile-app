import { useBottomTabOverflow } from '@/components/TabBar/TabBarBackground';
import { Button, ButtonText } from '@/components/ui/Button';
import { ThemedSafeAreaView } from '@/components/ui/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/ThemedText';
import tw from '@/lib/tw';
import { useNavigation } from '@react-navigation/native';

const NotFoundScreen = () => {
  const tabBarHeight = useBottomTabOverflow();
  const navigation = useNavigation();
  return (
      <ThemedSafeAreaView
      style={[
        tw.style("flex-1 justify-center items-center gap-2"),
        { paddingBottom: tabBarHeight },
      ]}
      >
        <ThemedText style={tw.style("text-3xl font-bold")}>This screen doesn't exist.</ThemedText>

        <Button onPress={() => navigation.goBack()}>
          <ButtonText>Go back !</ButtonText>
        </Button>
      </ThemedSafeAreaView>
  );
};

export default NotFoundScreen;