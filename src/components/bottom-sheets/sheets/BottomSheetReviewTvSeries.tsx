import React from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { UserReviewTvSeries } from '@recomendapp/types';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { PADDING_VERTICAL } from '@/theme/globals';
import { Alert } from 'react-native';
import { useUserReviewTvSeriesDeleteMutation } from '@/features/user/userMutations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';

interface BottomSheetReviewTvSeriesProps extends BottomSheetProps {
  review: UserReviewTvSeries,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
  closeOnPress?: boolean;
  disabled?: boolean;
}

export const BottomSheetReviewTvSeries = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetReviewTvSeriesProps
>(({ id, review, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const toast = useToast();
  const openSheet = useBottomSheetStore((state) => state.openSheet);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
  // Mutations
  const reviewDeleteMutation = useUserReviewTvSeriesDeleteMutation();
  // States
  const items = React.useMemo((): Item[][] => ([
    [
      ...additionalItemsTop,
    ],
    [
      {
        icon: Icons.Movie,
        onPress: () => router.push(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series_id}/review/${review.id}`),
        label: upperFirst(t('common.messages.go_to_review')),
        disabled: review.activity?.tv_series?.url ? pathname.startsWith(review.activity?.tv_series?.url) : false
      },
      ...(session?.user.id === review.activity?.user_id ? [
        {
          icon: Icons.Edit,
          onPress: () => router.push(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series_id}/review/${review.id}/edit`),
          label: upperFirst(t('common.messages.edit_review')),
        },
        {
          icon: Icons.Delete,
          onPress: async () => {
            Alert.alert(
              upperFirst(t('common.messages.are_u_sure')),
              undefined,
              [
                {
                  text: upperFirst(t('common.messages.cancel')),
                  style: 'cancel',
                },
                {
                  text: upperFirst(t('common.messages.delete')),
                  onPress: async () => {
                    await reviewDeleteMutation.mutateAsync(
                      { id: review.id, tvSeriesId: review.activity?.tv_series_id! },
                      {
                        onSuccess: () => {
                          toast.success(upperFirst(t('common.messages.deleted')));
                          if (pathname.startsWith(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series_id}/review/${review.id}`)) {
                            router.canGoBack() ? router.back() : router.replace(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series_id}`);
                          }
                          closeSheet(id);
                        },
                        onError: () => {
                          toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
                        },
                      }
                    );
                  },
                  style: 'destructive',
                }
              ]
            )
          },
          label: upperFirst(t('common.messages.delete')),
          closeOnPress: false,
        }
      ] : []),
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [review, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname, session]);

  return (
    <ThemedTrueSheet
    ref={ref}
    scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
    contentContainerStyle={tw`p-0`}
    {...props}
    >
      <ScrollView
      ref={scrollRef}
      bounces={false}
      contentContainerStyle={{ paddingTop: PADDING_VERTICAL, paddingBottom: insets.bottom }}
      >
        {items.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((item, j) => (
              <Button
              key={j}
              variant='ghost'
              icon={item.icon}
              iconProps={{
                color: colors.mutedForeground,
              }}
              disabled={item.disabled}
              style={tw`justify-start h-auto py-4`}
              onPress={() => {
                (item.closeOnPress || item.closeOnPress === undefined) && closeSheet(id);
                item.onPress();
              }}
              >
                {item.label}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </ScrollView>
    </ThemedTrueSheet>
  );
});
BottomSheetReviewTvSeries.displayName = 'BottomSheetReviewTvSeries';
