import * as React from "react"
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import upperFirst from 'lodash/upperFirst';
import { useUserFollowProfileQuery } from '@/features/user/userQueries';
import { Alert, ViewStyle } from 'react-native';
import { useUserFollowProfileInsertMutation, useUserFollowProfileDeleteMutation } from '@/features/user/userMutations';
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { CORNERS } from "@/theme/globals";
import { useToast } from "../Toast";
import { useTheme } from "@/providers/ThemeProvider";

interface ButtonUserFollowBaseProps
  extends React.ComponentProps<typeof Button> {
  }

type ButtonUserFollowSkeletonProps = {
  skeleton: true;
  profileId?: never;
}

type ButtonUserFollowDataProps = {
  skeleton?: false;
  profileId: string;
}

export type ButtonUserFollowProps = ButtonUserFollowBaseProps &
  (ButtonUserFollowSkeletonProps | ButtonUserFollowDataProps);

const ButtonUserFollow = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonUserFollowProps
>(({ profileId, onPress, skeleton, style, ...props }, ref) => {
  const t = useTranslations();
  const toast = useToast();
  const { user } = useAuth();
  const { mode } = useTheme();

  const {
    data: isFollow,
    isLoading,
  } = useUserFollowProfileQuery({
    userId: user?.id,
    followeeId: profileId,
  });
  const loading = skeleton || !profileId || isLoading || isFollow === undefined;

  const insertFollow = useUserFollowProfileInsertMutation();
  const deleteFollowerMutation = useUserFollowProfileDeleteMutation();

  const followUser = async () => {
    if (!user || !profileId) return;
    await insertFollow.mutateAsync({
      userId: user?.id,
      followeeId: profileId,
    }, {
      onError: (error) => {
        toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
      }
    });
  }

  const unfollowUser = async () => {
    if (!user || !profileId) return;
    Alert.alert(
      upperFirst(t('common.messages.are_u_sure')),
      undefined,
      [
        {
          text: upperFirst(t('common.messages.cancel')),
          style: 'cancel',
        },
        {
          text: isFollow?.is_pending ? upperFirst(t('common.messages.cancel_request')) : upperFirst(t('common.messages.unfollow')),
          onPress: async () => {
            await deleteFollowerMutation.mutateAsync({
              userId: user?.id,
              followeeId: profileId,
            }, {
              onError: (error) => {
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

  if (!user || user.id == profileId) return null;

  if (loading) {
    return (
      <Skeleton borderRadius={CORNERS} style={[tw`h-10 w-full`, style]} />
    )
  }

  return (
    <Button
    ref={ref}
    onPress={(e) => {
      isFollow ? unfollowUser() : followUser();
      onPress?.(e);
    }}
    variant={isFollow ? "muted" : "accent-yellow"}
    style={[
      tw.style('px-4 py-2 rounded-full'),
      style as ViewStyle,
    ]}
    {...props}
    >
      {isFollow ? (
        isFollow.is_pending ? upperFirst(t('common.messages.request_sent')) : upperFirst(t('common.messages.followed'))
      ) : upperFirst(t('common.messages.follow'))}
    </Button>
  );
});
ButtonUserFollow.displayName = "ButtonUserFollow";

export default ButtonUserFollow;
