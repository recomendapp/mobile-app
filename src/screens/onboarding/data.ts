import { Assets } from '@/constants/Assets';
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
  return [
    {
      id: 1,
      video: Assets.onboarding.tracking,
      text: upperFirst(t('pages.onboarding.tracking.description')),
      textColor: '#005b4f',
      backgroundColor: '#ffa3ce',
    },
    {
      id: 2,
      video: Assets.onboarding.recos,
      text: upperFirst(t('pages.onboarding.recos.description')),
      textColor: '#1e2169',
      backgroundColor: '#bae4fd',
    },
    {
      id: 3,
      video: Assets.onboarding.playlists,
      text: upperFirst(t('pages.onboarding.playlists.description')),
      textColor: '#F15937',
      backgroundColor: '#faeb8a',
    },
    {
      id: 4,
      video: Assets.onboarding.social,
      text: upperFirst(t('pages.onboarding.social.description')),
      textColor: '#004f91',
      backgroundColor: '#d5afff',
    }
  ];
});

export default useOnboardingData;