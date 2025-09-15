import { Button } from "@/components/ui/Button";
import { Onboarding, OnboardingStep } from "@/components/ui/onboarding";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useMemo } from "react";
import { useTranslations } from "use-intl";

const images = {
  tracking: require('@/assets/images/auth/login/background/1.gif'),
}

const AuthScreen = () => {
  const { colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();

  const presets = useMemo((): { [key: string]: OnboardingStep[] } => ({
    features: [
      {
        id: 'tracking',
        title: upperFirst(t('pages.onboarding.tracking.label')),
        description: t('pages.onboarding.tracking.description'),
        icon: <Icons.Check color={colors.accentYellow} size={80} />,
        image: <Image source={images.tracking} style={tw`w-full aspect-square`} contentFit="contain" />,
      },
      {
        id: 'recos',
        title: upperFirst(t('pages.onboarding.recos.label')),
        description: t('pages.onboarding.recos.description'),
        icon: <Icons.Reco color={colors.accentYellow} size={80} />,
        image: <Image source={images.tracking} style={tw`w-full aspect-square`} contentFit="contain" />,
      },
      {
        id: 'playlists',
        title: upperFirst(t('pages.onboarding.playlists.label')),
        description: t('pages.onboarding.playlists.description'),
        icon: <Icons.Playlist color={colors.accentYellow} size={80} />,
        image: <Image source={images.tracking} style={tw`w-full aspect-square`} contentFit="contain" />,
      },
      {
        id: 'social',
        title: upperFirst(t('pages.onboarding.social.label')),
        description: t('pages.onboarding.social.description'),
        icon: <Icons.Users color={colors.accentYellow} size={80} />,
        image: <Image source={images.tracking} style={tw`w-full aspect-square`} contentFit="contain" />,
      }
    ]
  }) as const, [t]);
  
	return (
    <>
    <Onboarding
    showCancel={false}
    onComplete={() => {}}
    steps={presets.features}
    showSkip={false}
    showNavigation={false}
    />
    <ThemedSafeAreaView style={tw`flex-row justify-between items-center gap-2 px-4`}>
      <Link href="/auth/signup" asChild>
        <Button variant="accent-yellow" style={{ flex: 1 }} textStyle={tw`font-semibold`}>
          {upperFirst(t('common.messages.signup'))}
        </Button>
      </Link>
      <Link href="/auth/login" asChild>
        <Button variant="default" style={{ flex: 1 }} textStyle={tw`font-semibold`}>
          {upperFirst(t('common.messages.login'))}
        </Button>
      </Link>
    </ThemedSafeAreaView>
    </>
  	);
};

export default AuthScreen;