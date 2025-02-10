import { useAuth } from "@/context/AuthProvider";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/" />; // Redirige les utilisateurs connectés
  }

  return <Stack screenOptions={{headerShown: false}}/>;
};

export default AuthLayout;