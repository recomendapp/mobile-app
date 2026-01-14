import { forwardRef, useMemo } from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { UserReviewMovie } from '@recomendapp/types';
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
import { useUserReviewMovieDeleteMutation } from '@/api/users/userMutations';
import { useToast } from '@/components/Toast';
import { FlashList } from '@shopify/flash-list';

interface BottomSheetReviewMovieProps extends BottomSheetProps {
  review: UserReviewMovie,
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

export const BottomSheetReviewMovie = forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetReviewMovieProps
>(({ id, review, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const toast = useToast();
  const { colors, mode } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // Mutations
  const { mutateAsync: reviewDeleteMutation } = useUserReviewMovieDeleteMutation();
  // States
  const items = useMemo<Item[]>(() => [
    ...additionalItemsTop,
    {
      icon: Icons.Movie,
      onPress: () => router.push(`/film/${review.activity?.movie?.slug || review.activity?.movie_id}/review/${review.id}`),
      label: upperFirst(t('common.messages.go_to_review')),
      disabled: review.activity?.movie?.url ? pathname.startsWith(review.activity?.movie?.url) : false
    },
    ...(session?.user.id === review.activity?.user_id ? [
      {
        icon: Icons.Edit,
        onPress: () => router.push(`/film/${review.activity?.movie?.slug || review.activity?.movie_id}/review/${review.id}/edit`),
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
                    { id: review.id, movieId: review.activity?.movie_id! },
                    {
                      onSuccess: () => {
                        toast.success(upperFirst(t('common.messages.deleted')));
                        if (pathname.startsWith(`/film/${review.activity?.movie?.slug || review.activity?.movie_id}/review/${review.id}`)) {
                          if (router.canGoBack()) {
                            router.back()
                          } else {
                            router.replace(`/film/${review.activity?.movie?.slug || review.activity?.movie_id}`);
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
    pathname,
    review,
    router,
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
      data={items}
      contentContainerStyle={{ paddingTop: PADDING_VERTICAL }}
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
BottomSheetReviewMovie.displayName = 'BottomSheetReviewMovie';
