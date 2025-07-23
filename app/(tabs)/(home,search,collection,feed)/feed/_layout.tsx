import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack, withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import tw from "@/lib/tw";
import { View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/providers/ThemeProvider";
import { Pressable } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash";
import { title } from "@/hooks/custom-lodash";
import { SafeAreaView } from "react-native-safe-area-context";

const FeedLayout = () => {
  const { t } = useTranslation();
  const { session } = useAuth();

  if (session === null) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <SafeAreaView style={tw`flex-1`}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
};

export default FeedLayout;