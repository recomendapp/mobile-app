import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      animationDuration: 200
    }}
    />
  );
};

export default AuthLayout;