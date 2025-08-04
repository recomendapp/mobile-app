import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { Href, Redirect, Stack, usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SPACE = 8;

const AuthLayout = () => {
  const router = useRouter();
  const isOpened = router.canGoBack();
  const { session } = useAuth();
  const pathname = usePathname();
  if (session) {
    const redirectTo: Href = pathname.startsWith("/auth/reset-password")
      ? "/settings/security"
      : "/";
    return <Redirect href={redirectTo} />;
  }
  return (
    <Stack
    screenOptions={{
      headerShown: true,
      header: (props) => (
        <SafeAreaView 
        style={{
          position: 'absolute',
          top: SPACE,
          right: SPACE,
        }}
        >
          <Button
          variant="ghost"
          icon={Icons.Cancel}
          size="icon"
          onPress={() => isOpened ? router.back() : router.replace('/')}
          />
        </SafeAreaView>
      ),
      presentation: 'modal'
    }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;