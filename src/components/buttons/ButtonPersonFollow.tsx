import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import upperFirst from 'lodash/upperFirst';
import { Alert, ViewStyle } from 'react-native';
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { useToast } from "../Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { forwardRef } from 'react';
import { useUserFollowPersonQuery } from '@/api/users/userQueries';
import { useUserFollowPersonDeleteMutation, useUserFollowPersonInsertMutation } from '@/api/users/userMutations';

type ButtonPersonFollowSkeletonProps = {
  skeleton: true;
  personId?: never;
}

type ButtonPersonFollowDataProps = {
  skeleton?: false;
  personId: number;
}

export type ButtonPersonFollowProps = React.ComponentProps<typeof Button> &
  (ButtonPersonFollowSkeletonProps | ButtonPersonFollowDataProps);

const ButtonPersonFollow = forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonPersonFollowProps
>(({ personId, onPress, skeleton, style, ...props }, ref) => {
  const toast = useToast();
  const t = useTranslations();
  const { session } = useAuth();
  const { mode } = useTheme();

  const {
    data: isFollow,
    isLoading,
  } = useUserFollowPersonQuery({
    userId: session?.user.id,
    personId: personId,
  });
  const loading = skeleton || !personId || isLoading || isFollow === undefined;

  const { mutateAsync: insertFollow } = useUserFollowPersonInsertMutation();
  const { mutateAsync: deleteFollowerMutation } = useUserFollowPersonDeleteMutation();

  const followPerson = async () => {
    if (!session || !personId) return;
    await insertFollow({
      userId: session.user.id,
      personId: personId,
    }, {
      onError: (error) => {
        toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
      }
    });
  }

  const unfollowPerson = async () => {
    if (!session || !personId) return;
    Alert.alert(
      upperFirst(t('common.messages.are_u_sure')),
      undefined,
      [
        {
          text: upperFirst(t('common.messages.cancel')),
          style: 'cancel',
        },
        {
          text: upperFirst(t('common.messages.unfollow')),
          onPress: async () => {
            await deleteFollowerMutation({
              userId: session.user.id,
              personId: personId,
            }, {
              onError: (error) => {
                // Burnt.toast({
                //   title: upperFirst(t('common.messages.error')),
                //   message: upperFirst(t('common.messages.an_error_occurred')),
                //   preset: 'error',
                //   haptic: 'error',
                // });
                toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
              }
            });
          },
          style: 'destructive',
        }
      ], {
        userInterfaceStyle: mode,
      }
    );
  }

  if (!session || loading) return null;

  return (
    <Button
    ref={ref}
    onPress={async (e) => {
      if (isFollow) {
        await unfollowPerson()
      } else {
        await followPerson()
      }
      onPress?.(e);
    }}
    variant={isFollow ? "muted" : "accent-yellow"}
    style={[
      tw.style('px-4 py-2 h-auto rounded-full'),
      style as ViewStyle,
    ]}
    {...props}
    >
      {isFollow ? (
        upperFirst(t('common.messages.followed'))
      ) : upperFirst(t('common.messages.follow'))}
    </Button>
  );
});
ButtonPersonFollow.displayName = "ButtonPersonFollow";

export default ButtonPersonFollow;
