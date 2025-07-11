import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/" />; // Redirige les utilisateurs connectés
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;