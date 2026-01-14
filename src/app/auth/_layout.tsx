import { useTheme } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const AuthLayout = () => {
  const t = useTranslations();
  const { colors } = useTheme();
  return (
    <Stack
    initialRouteName="index"
    screenOptions={{
      animation: 'ios_from_right',
      headerTintColor: colors.foreground,
      headerTransparent: true,
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerBackButtonDisplayMode: 'minimal',
    }}
    >
      <Stack.Screen name="index" options={{ title: upperFirst(t('common.messages.welcome')) }} />
      <Stack.Screen name="login/index" options={{ headerTitle: upperFirst(t('common.messages.login')) }} />
      <Stack.Screen name="login/otp" options={{ headerTitle: upperFirst(t('common.messages.otp')) }} />
      <Stack.Screen name="signup" options={{ headerTitle: upperFirst(t('common.messages.signup')) }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: upperFirst(t('pages.auth.forgot_password.label')) }} />
      {/* CALLBACKs */}
      <Stack.Screen name="callback" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;