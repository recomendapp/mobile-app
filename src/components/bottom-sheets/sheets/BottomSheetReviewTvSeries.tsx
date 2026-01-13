import { forwardRef, useMemo } from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { UserReviewTvSeries } from '@recomendapp/types';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { PADDING_VERTICAL } from '@/theme/globals';
import { Alert } from 'react-native';
import { useUserReviewTvSeriesDeleteMutation } from '@/api/users/userMutations';
import { useToast } from '@/components/Toast';
import { FlashList } from '@shopify/flash-list';

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

export const BottomSheetReviewTvSeries = forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetReviewTvSeriesProps
>(({ id, review, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const toast = useToast();
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const { colors, mode } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // Mutations
  const { mutateAsync: reviewDeleteMutation } = useUserReviewTvSeriesDeleteMutation();
  // States
  const items = useMemo<Item[]>(() => [
    ...additionalItemsTop,
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
                  await reviewDeleteMutation(
                    { id: review.id, tvSeriesId: review.activity?.tv_series_id! },
                    {
                      onSuccess: () => {
                        toast.success(upperFirst(t('common.messages.deleted')));
                        if (pathname.startsWith(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series_id}/review/${review.id}`)) {
                          if (router.canGoBack()) {
                            router.back()
                          } else {
                            router.replace(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series_id}`);
                          }
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
            ], {
              userInterfaceStyle: mode,
            }
          )
        },
        label: upperFirst(t('common.messages.delete')),
        closeOnPress: false,
      }
    ] : []),
    ...additionalItemsBottom,
  ], [
    additionalItemsTop,
    additionalItemsBottom,
    closeSheet,
    id,
    mode,
    router,
    pathname,
    review.activity?.tv_series?.slug,
    review.activity?.tv_series_id,
    review.activity?.tv_series?.url,
    review.id,
    review.activity?.user_id,
    session?.user.id,
    t,
    toast,
    reviewDeleteMutation,
  ]);
  return (
    <TrueSheet
    ref={ref}
    scrollable
    {...props}
    >
      <FlashList
      contentContainerStyle={{ paddingTop: PADDING_VERTICAL }}
      data={items}
      bounces={false}
      keyExtractor={(_, i) => i.toString()}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <Button
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
      )}
      indicatorStyle={mode === 'dark' ? 'white' : 'black'}
      nestedScrollEnabled
      />
    </TrueSheet>
  );
});
BottomSheetReviewTvSeries.displayName = 'BottomSheetReviewTvSeries';
