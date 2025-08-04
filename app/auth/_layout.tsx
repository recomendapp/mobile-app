import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { Href, Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SPACE = 8;

const AuthLayout = () => {
  const router = useRouter();
  const isOpened = router.canGoBack();
  // const { session } = useAuth();
  // const router = useRouter();
  // const pathname = usePathname();
  // useEffect(() => {
  //   if (session) {
  //     console.log("pathname:", pathname);
  //     router.canDismiss() && router.dismissAll();
  //     const redirectTo: Href = pathname.startsWith("/auth/forgot-password")
  //       ? "/settings/security"
  //       : "/";
  //     router.replace(redirectTo);
  //   }
  // }, [session, pathname]);
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