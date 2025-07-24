import { useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
  );
};

export default AuthLayout;