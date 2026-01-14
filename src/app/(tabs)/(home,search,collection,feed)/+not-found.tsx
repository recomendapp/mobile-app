import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { Stack, useRouter } from 'expo-router';

const NotFoundScreen = () => {
  const router = useRouter();
  const { bottomOffset } = useTheme();
  return (
  <>
    <Stack.Screen options={{ title: 'Oops!' }} /> 
    <View
    style={[
      tw.style("flex-1 justify-center items-center gap-2"),
      { paddingBottom: bottomOffset },
    ]}
    >
      <Text style={tw.style("text-3xl font-bold")}>This screen doesn&apos;t exist.</Text>

      <Button onPress={() => router.back()}>Go back!</Button>
    </View>
  </>
  );
};

export default NotFoundScreen;