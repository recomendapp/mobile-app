import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { Href, Redirect, Stack, useNavigation, useNavigationContainerRef, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SPACE = 8;

const AuthLayout = () => {
  const router = useRouter();
  const isOpened = router.canGoBack();
  const { session } = useAuth();
  const pathname = usePathname();
  // if (session) {
  //   const redirectTo: Href = pathname.startsWith("/auth/reset-password")
  //     ? "/settings/security"
  //     : "/";
  //   return <Redirect href={redirectTo} />;
  // }

  useEffect(() => {
    if (session) {
      const redirectTo: Href = pathname.startsWith("/auth/reset-password")
        ? "/settings/security"
        : "/";
      if (router.canDismiss()) router.dismissAll();
      router.replace(redirectTo);
    }
  }, [session]);
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