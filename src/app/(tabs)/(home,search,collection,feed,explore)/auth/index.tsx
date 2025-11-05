import { Button } from "@/components/ui/Button";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, GAP_XL, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Href, Link, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { ScrollView, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { LinearGradient } from 'expo-linear-gradient';
import Color from "color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { UIBackgroundsOptions } from "@/api/options";
import { useRotatingItem } from "@/hooks/useRotatingItem";
import { Text } from "@/components/ui/text";
import { getMediaDetails } from "@/components/utils/getMediaDetails";
import { Database } from "@recomendapp/types";
import CrossfadeImage from "@/components/ui/CrossfadeImage";
import { useHeaderHeight } from "@react-navigation/elements";

const AuthHeader = ({
  activeBackground,
} : {
  activeBackground?: Database['public']['Functions']['get_ui_backgrounds']['Returns'][number] & { localUri: string };
}) => {
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const bgColor = Color(colors.background).rgb().object();
  return (
    <View style={[tw`items-center justify-end`, { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, paddingTop: headerHeight, height: SCREEN_HEIGHT * 0.5 }]}>
      <Animated.View style={tw`absolute inset-0`}>
        {activeBackground && (<CrossfadeImage source={activeBackground.localUri} style={tw`w-full h-full`} contentFit="cover" />)}
        <LinearGradient
        style={tw`absolute inset-0`}
        colors={[
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.3)`,
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.4)`,
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.5)`,
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.8)`,
          `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`,
        ]}
        />
      </Animated.View>
      <Icons.app.logo color={colors.accentYellow} width={SCREEN_WIDTH * 0.75} />
    </View>
  )
};


const AuthScreen = () => {
  const t = useTranslations();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
  } = useQuery(UIBackgroundsOptions());
  const {
    active 
  } = useRotatingItem({ items: data });

  const routes: { name: string; href: Href }[] = [
    { name: upperFirst(t('common.messages.login')), href: '/auth/login' },
    { name: upperFirst(t('common.messages.signup')), href: '/auth/signup' },
    { name: upperFirst(t('common.messages.show_me_around')), href: '/onboarding' },
  ]

  const activeDetails = active ? (
    active.media_type === 'movie' ? getMediaDetails({ type: 'movie', media: active.media })
    : active.media_type === 'tv_series' ? getMediaDetails({ type: 'tv_series', media: active.media })
    : null
  ) : undefined;
  
	return (
  <>
    <Stack.Screen
    options={{
      headerTitle: () => <></>,
      headerRight: () => (
        <Button variant="muted" icon={Icons.X} size="icon" style={tw`rounded-full`} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      )
    }}
    />
    <ScrollView
    style={tw`flex-1`}
    contentContainerStyle={[{ gap: GAP_XL, paddingBottom: insets.bottom + PADDING_VERTICAL }]}
    stickyHeaderIndices={[0]}
    bounces={false}
    showsVerticalScrollIndicator={false}
    >
      <AuthHeader activeBackground={active}/>
      <View style={{ gap: GAP, paddingHorizontal: PADDING_HORIZONTAL,  }}>
        {routes.map((route, index) => (
          <Link key={index} href={route.href} asChild>
            <Button variant='muted' textStyle={tw`font-semibold`}>
              {route.name}
            </Button>
          </Link>
        ))}
      </View>
      <View style={{ paddingHorizontal: PADDING_HORIZONTAL }}>
        {activeDetails && (
          <Animated.Text key={active.id} entering={FadeIn} exiting={FadeOut} style={[tw`text-center`, { color: colors.mutedForeground }]}>
            {t.rich('common.messages.artwork_from', {
              source: activeDetails.title!,
              important: (chunk) => <Text textColor='default' style={tw`font-semibold`}>{chunk}</Text>
            })}
          </Animated.Text>
        )}
      </View>
    </ScrollView>
  </>
  );
};

export default AuthScreen;