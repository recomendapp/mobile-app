import { useAuth } from "@/providers/AuthProvider";
import { Href, Redirect, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useMemo, useCallback, memo } from "react";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUIStore } from "@/stores/useUIStore";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { View } from "@/components/ui/view";

type SegmentedOption = {
  label: string;
  value: 'community' | 'cast_and_crew';
  href: Href;
  route: string;
};

const FeedHeader = memo(({
  segmentedOptions,
  feedView,
  onValueChange,
  inset
}: {
  segmentedOptions: SegmentedOption[];
  feedView: 'community' | 'cast_and_crew';
  onValueChange: (value: string) => void;
  inset: { top: number; left: number; right: number; bottom: number };
}) => {
  return (
    <View
    style={{
      paddingTop: inset.top,
      paddingLeft: inset.left + PADDING_HORIZONTAL,
      paddingRight: inset.right + PADDING_HORIZONTAL,
      paddingBottom: PADDING_VERTICAL
    }}
    >
      <SegmentedControl
        values={segmentedOptions.map(option => option.label)}
        selectedIndex={segmentedOptions.findIndex(option => option.value === feedView)}
        onValueChange={onValueChange}
      />
    </View>
  );
});
FeedHeader.displayName = 'FeedHeader';

const FeedLayout = memo(() => {
  const t = useTranslations();
  const router = useRouter();
  const { session } = useAuth();
  const { inset } = useTheme();
  const feedView = useUIStore(state => state.feedView);
  const setFeedView = useUIStore(state => state.setFeedView);

  const segmentedOptions = useMemo((): SegmentedOption[] => [
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

  const handleValueChange = useCallback((value: string) => {
    const selectedOption = segmentedOptions.find(option => option.label === value);
    if (selectedOption) {
      setFeedView(selectedOption.value);
      router.replace(selectedOption.href);
    }
  }, [segmentedOptions, setFeedView, router]);

  if (session === null) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <>
      <Stack.Screen
      options={{
        header: () => (
          <FeedHeader
            segmentedOptions={segmentedOptions}
            feedView={feedView}
            onValueChange={handleValueChange}
            inset={inset}
          />
        )
      }}
      />
      <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={segmentedOptions.find(option => option.value === feedView)?.route}
      >
        <Stack.Screen
          name="index"
          options={{ animation: 'slide_from_left' }}
        />
        <Stack.Screen
          name="cast-crew"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
});
FeedLayout.displayName = 'FeedLayout';

export default FeedLayout;