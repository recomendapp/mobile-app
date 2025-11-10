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
      // textColor: '#f9f871',
      // backgroundColor: '#1b0d13ff',
      textColor: colors.accentBlue,
      backgroundColor: '#eee8a9',
    },
    {
      id: 2,
      video: Assets.onboarding.recos,
      text: upperFirst(t('pages.onboarding.recos.description')),
      // textColor: '#efb7cf',
      // backgroundColor: '#13232dff',
      textColor: colors.accentYellow,
      backgroundColor: '#1b0d13ff',
    },
    {
      id: 3,
      video: Assets.onboarding.playlists,
      text: upperFirst(t('pages.onboarding.playlists.description')),
      textColor: '#ee6a4dff',
      backgroundColor: '#0c1b12ff',
    },
    {
      id: 4,
      video: Assets.onboarding.social,
      text: upperFirst(t('pages.onboarding.social.description')),
      textColor: colors.accentPink,
      backgroundColor: '#008bc2',
    }
  ];
});

export default useOnboardingData;