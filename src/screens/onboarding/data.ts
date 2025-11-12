import { Assets } from '@/constants/Assets';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';

export interface OnboardingData {
  id: number;
  video: string;
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
      video: Assets.onboarding.tracking,
      text: upperFirst(t('pages.onboarding.tracking.description')),
      textColor: colors.foreground,
      backgroundColor: colors.background,
    },
    {
      id: 2,
      video: Assets.onboarding.recos,
      text: upperFirst(t('pages.onboarding.recos.description')),
      textColor: colors.accentYellowForeground,
      backgroundColor: colors.accentYellow,
    },
    {
      id: 3,
      video: Assets.onboarding.playlists,
      text: upperFirst(t('pages.onboarding.playlists.description')),
      textColor: colors.foreground,
      backgroundColor: colors.background,
    },
    {
      id: 4,
      video: Assets.onboarding.social,
      text: upperFirst(t('pages.onboarding.social.description')),
      textColor: colors.accentYellowForeground,
      backgroundColor: colors.accentYellow,
    }
  ];
});

export default useOnboardingData;