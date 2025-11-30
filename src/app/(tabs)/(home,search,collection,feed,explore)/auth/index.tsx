import { Button } from "@/components/ui/Button";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, GAP_XL, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Href, Link, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { ScrollView, useWindowDimensions } from "react-native";
import { useTranslations } from "use-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

const AuthHeader = () => {
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  return (
    <View style={[tw`items-center justify-end`, { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, paddingTop: headerHeight, height: SCREEN_HEIGHT * 0.5 }]}>
      <Icons.app.logo color={colors.accentYellow} width={SCREEN_WIDTH * 0.75} />
    </View>
  )
};

const AuthScreen = () => {
  const t = useTranslations();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const routes: { name: string; href: Href }[] = [
    { name: upperFirst(t('common.messages.login')), href: '/auth/login' },
    { name: upperFirst(t('common.messages.signup')), href: '/auth/signup' },
    { name: upperFirst(t('common.messages.show_me_around')), href: '/onboarding' },
  ]
  
	return (
  <>
    <Stack.Screen
    options={{
      headerLeft: () => <></>,
      headerTitle: () => <></>,
      headerRight: () => (
        <Button variant="muted" icon={Icons.X} size="icon" style={[tw`rounded-full`, { marginRight: PADDING_HORIZONTAL }]} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
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
      <AuthHeader />
      <View style={{ gap: GAP, paddingHorizontal: PADDING_HORIZONTAL,  }}>
        {routes.map((route, index) => (
          <Link key={index} href={route.href} asChild>
            <Button variant='muted' textStyle={tw`font-semibold`}>
              {route.name}
            </Button>
          </Link>
        ))}
      </View>
    </ScrollView>
  </>
  );
};

export default AuthScreen;