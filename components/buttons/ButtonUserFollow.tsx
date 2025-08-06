import * as React from "react"
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import upperFirst from 'lodash/upperFirst';
import { useUserFollowProfile } from '@/features/user/userQueries';
import { ViewStyle } from 'react-native';
import { useUserFollowProfileInsert, useUserUnfollowProfileDelete } from '@/features/user/userMutations';
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";

interface ButtonUserFollowProps
  extends React.ComponentProps<typeof Button> {
    profileId?: string | null;
    skeleton?: boolean;
  }

const ButtonUserFollow = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonUserFollowProps
>(({ profileId, skeleton, style, ...props }, ref) => {
  const t = useTranslations();
  const { user } = useAuth();

  const {
    data: isFollow,
    isLoading,
  } = useUserFollowProfile({
    userId: user?.id,
    followeeId: profileId,
  });

  const insertFollow = useUserFollowProfileInsert();
  const deleteFollowerMutation = useUserUnfollowProfileDelete();

  const followUser = async () => {
    (user?.id && profileId) &&
      (await insertFollow.mutateAsync({
        userId: user?.id,
        followeeId: profileId,
      }, {
        onError: (error) => {
          // toast.error(upperFirst(t('common.errors.an_error_occurred')));
        }
      }));
  }

  const unfollowUser = async () => {
    (user?.id && profileId) &&
      (await deleteFollowerMutation.mutateAsync({
        userId: user?.id,
        followeeId: profileId,
      }, {
        onError: (error) => {
          // toast.error(upperFirst(t('common.errors.an_error_occurred')));
        }
      }));
  }
  const loading = skeleton || !profileId || isLoading || isFollow === undefined;

  if (!user || user.id == profileId) return null;

  if (loading) {
    return (
      <Skeleton borderRadius={999} style={tw.style("h-10 w-32")} />
    )
  }

  return (
    <Button
    ref={ref}
    onPress={() => (isFollow ? unfollowUser() : followUser())}
    variant="accent-yellow"
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
