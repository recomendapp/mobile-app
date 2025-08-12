import { useAuth } from "@/providers/AuthProvider";
import { Href, Redirect, Stack, usePathname, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/providers/ThemeProvider";
import { Pressable } from "react-native-gesture-handler";
import { upperFirst } from "lodash";
import { title } from "@/utils/custom-lodash";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Icons } from "@/constants/Icons";
import { useMemo } from "react";
import { useTranslations } from "use-intl";

const FeedLayout = () => {
  const t = useTranslations();
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();
  const { showActionSheetWithOptions } = useActionSheet();
  const feedOptions: { label: string; value: string; route: Href }[] = [
    { label: upperFirst(t('common.messages.community')), value: 'community', route: '/feed' },
    { label: title(t('common.messages.cast_and_crew')), value: 'cast_and_crew', route: '/feed/cast-crew' },
  ];
  const activeOption = useMemo(() => {
    return feedOptions.find(option => option.route === pathname) || feedOptions[0];
  }, [feedOptions, pathname]);
  // Handlers
  const handleFeedOptions = () => {
    const feedOptionsWithCancel = [
      ...feedOptions,
      { label: upperFirst(t('common.messages.cancel')), value: 'cancel', route: '' as Href },
    ];
    const cancelIndex = feedOptionsWithCancel.length - 1;
    showActionSheetWithOptions({
      options: feedOptionsWithCancel.map(option => option.label),
      disabledButtonIndices: activeOption ? [feedOptionsWithCancel.findIndex(option => option.value === activeOption.value)] : [],
      cancelButtonIndex: cancelIndex
    }, (index) => {
      if (index === undefined || index === cancelIndex) return;
      const selectedOption = feedOptionsWithCancel[index];
      if (selectedOption) {
        router.replace(selectedOption.route);
      }
    });
  };

  if (session === null) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <SafeAreaView style={tw`flex-1`}>
      <Pressable onPress={handleFeedOptions} style={tw`flex-row items-center px-4 pb-2`}>
        <ThemedText style={tw`text-lg font-semibold`}>{activeOption?.label}</ThemedText>
        <Icons.ChevronDown color={colors.mutedForeground} />
      </Pressable>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
        name="index"
        options={{
          animation: 'slide_from_left',
        }}
        />
        <Stack.Screen
        name="cast-crew"
        options={{
          animation: 'slide_from_right',
        }}
        />
      </Stack>
    </SafeAreaView>
  );
};

export default FeedLayout;