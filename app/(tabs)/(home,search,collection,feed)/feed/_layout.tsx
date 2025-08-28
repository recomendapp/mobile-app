import { useAuth } from "@/providers/AuthProvider";
import { Href, Redirect, Stack, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { useMemo } from "react";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUIStore } from "@/stores/useUIStore";
import { BlurView } from "expo-blur";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";

const FeedLayout = () => {
  const t = useTranslations();
  const router = useRouter();
  const { session } = useAuth();
  const { inset } = useTheme();
  const feedView = useUIStore(state => state.feedView);
  const setFeedView = useUIStore(state => state.setFeedView);
  // States
  const segmentedOptions = useMemo((): { label: string, value: 'community' | 'cast_and_crew', href: Href, route: string }[] => [
      {
          label: upperFirst(t('common.messages.community')),
          value: 'community',
          href: '/feed',
          route: 'index'
      },
      {
          label: upperFirst(t('common.messages.cast_and_crew')),
          value: 'cast_and_crew',
          href: '/feed/cast-crew',
          route: 'cast-crew'
      },
  ], [t]);

  if (session === null) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <>
      <Stack.Screen
      options={{
        header: () => (
          <BlurView
          tint="dark"
          intensity={100}
          style={[
            { paddingTop: inset.top, paddingLeft: inset.left + PADDING_HORIZONTAL, paddingRight: inset.right + PADDING_HORIZONTAL, paddingBottom: PADDING_VERTICAL },
          ]}
          experimentalBlurMethod="dimezisBlurView"
          >
            <SegmentedControl
            values={segmentedOptions.map(option => option.label)}
            selectedIndex={segmentedOptions.findIndex(option => option.value === feedView)}
            onValueChange={(value) => {
              setFeedView(segmentedOptions.find(option => option.label === value)!.value);
              router.replace(segmentedOptions.find(option => option.label === value)!.href);
            }}
            />
          </BlurView>
        ),
        headerTransparent: true,
      }}
      />
      <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={segmentedOptions.find(option => option.value === feedView)?.route}
      >
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
    </>
  );
};

export default FeedLayout;