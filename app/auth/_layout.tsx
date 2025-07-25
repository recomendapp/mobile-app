import { useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

const AuthLayout = () => {
  const { session } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (session) {
      router.dismissAll();
      router.replace("/");
    }
  }, [session]);
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }} />
  );
};

export default AuthLayout;