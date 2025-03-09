'use client';

import { Button, buttonTextVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthProvider';
import { useTranslation } from 'react-i18next';
import upperFirst from 'lodash/upperFirst';
import { useUserFollowProfile } from '@/features/user/userQueries';
import { Text } from 'react-native';
import { useUserFollowProfileInsert, useUserUnfollowProfileDelete } from '@/features/user/userMutations';

interface ButtonUserFollowProps {
  profileId?: string | null;
  skeleton?: boolean;
}

const ButtonUserFollow = ({
  profileId,
  skeleton,
}: ButtonUserFollowProps) => {
  const { t } = useTranslation();
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

  if (!user || user.id == profileId) return null;

  if (skeleton || !profileId || isLoading || isFollow === undefined) {
    return (
      <Skeleton className="h-10 w-32 rounded-full" />
    );
  }

  return (
    <Button
      //   variant={'accent-1'}
      onPress={() => (isFollow ? unfollowUser() : followUser())}
      className="rounded-full py-0"
    >
      <Text className={buttonTextVariants({ variant: 'default' })}>
        {isFollow ? (
          isFollow.is_pending ? upperFirst(t('common.messages.request_sent')) : upperFirst(t('common.messages.followed'))
        ) : upperFirst(t('common.messages.follow'))}
      </Text>
    </Button>
  );
};

export default ButtonUserFollow;
