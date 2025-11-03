import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';

export interface OnboardingData {
  id: number;
  animation: string;
  text: string;
  textColor: string;
  backgroundColor: string;
}

const useData = ((): OnboardingData[] => {
  const t = useTranslations();
  return [
    {
      id: 1,
      animation: require('@/assets/animations/onboarding/Lottie1.json'),
      text: upperFirst(t('pages.onboarding.tracking.description')),
      textColor: '#005b4f',
      backgroundColor: '#ffa3ce',
    },
    {
      id: 2,
      animation: require('@/assets/animations/onboarding/Lottie2.json'),
      text: upperFirst(t('pages.onboarding.recos.description')),
      textColor: '#1e2169',
      backgroundColor: '#bae4fd',
    },
    {
      id: 3,
      animation: require('@/assets/animations/onboarding/Lottie3.json'),
      text: upperFirst(t('pages.onboarding.playlists.description')),
      textColor: '#F15937',
      backgroundColor: '#faeb8a',
    },
    {
      id: 4,
      animation: require('@/assets/animations/onboarding/Lottie3.json'),
      text: upperFirst(t('pages.onboarding.social.description')),
      textColor: '#004f91',
      backgroundColor: '#d5afff',
    }
  ];
});

export default useData;