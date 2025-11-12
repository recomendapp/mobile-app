import { Assets } from '@/constants/Assets';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';

export interface OnboardingData {
  id: number;
  image: string;
  text: string;
  textColor: string;
  backgroundColor: string;
}

const useOnboardingData = ((): OnboardingData[] => {
  const t = useTranslations();
  const { colors } = useTheme();
  return [
    {
      id: 1,
      image: Assets.onboarding.tracking,
      text: upperFirst(t('pages.onboarding.tracking.description')),
      textColor: colors.foreground,
      backgroundColor: colors.background,
    },
    {
      id: 2,
      image: Assets.onboarding.recos,
      text: upperFirst(t('pages.onboarding.recos.description')),
      textColor: colors.accentYellowForeground,
      backgroundColor: colors.accentYellow,
    },
    {
      id: 3,
      image: Assets.onboarding.playlists,
      text: upperFirst(t('pages.onboarding.playlists.description')),
      textColor: colors.foreground,
      backgroundColor: colors.background,
    },
    {
      id: 4,
      image: Assets.onboarding.feed,
      text: upperFirst(t('pages.onboarding.feed.description')),
      textColor: colors.accentYellowForeground,
      backgroundColor: colors.accentYellow,
    },
    {
      id: 5,
      image: Assets.onboarding.socialSharing,
      text: upperFirst(t('pages.onboarding.social_sharing.description')),
      textColor: colors.foreground,
      backgroundColor: colors.background,
    },
  ];
});

export default useOnboardingData;