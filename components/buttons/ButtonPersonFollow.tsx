import * as React from "react"
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import upperFirst from 'lodash/upperFirst';
import { useUserFollowPersonQuery } from '@/features/user/userQueries';
import { Alert, ViewStyle } from 'react-native';
import { useUserFollowPersonInsertMutation, useUserFollowPersonDeleteMutation } from '@/features/user/userMutations';
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import * as Burnt from "burnt";
import { CORNERS } from "@/theme/globals";

interface ButtonPersonFollowBaseProps
  extends React.ComponentProps<typeof Button> {
  }

type ButtonPersonFollowSkeletonProps = {
  skeleton: true;
  personId?: never;
}

type ButtonPersonFollowDataProps = {
  skeleton?: false;
  personId: number;
}

export type ButtonPersonFollowProps = ButtonPersonFollowBaseProps &
  (ButtonPersonFollowSkeletonProps | ButtonPersonFollowDataProps);

const ButtonPersonFollow = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonPersonFollowProps
>(({ personId, onPress, skeleton, style, ...props }, ref) => {
  const t = useTranslations();
  const { session } = useAuth();

  const {
    data: isFollow,
    isLoading,
  } = useUserFollowPersonQuery({
    userId: session?.user.id,
    personId: personId,
  });
  const loading = skeleton || !personId || isLoading || isFollow === undefined;

  const insertFollow = useUserFollowPersonInsertMutation();
  const deleteFollowerMutation = useUserFollowPersonDeleteMutation();

  const followPerson = async () => {
    if (!session || !personId) return;
    await insertFollow.mutateAsync({
      userId: session.user.id,
      personId: personId,
    }, {
      onError: (error) => {
        console.log(error);
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(t('common.messages.an_error_occurred')),
          preset: 'error',
          haptic: 'error',
        });
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
            await deleteFollowerMutation.mutateAsync({
              userId: session.user.id,
              personId: personId,
            }, {
              onError: (error) => {
                Burnt.toast({
                  title: upperFirst(t('common.messages.error')),
                  message: upperFirst(t('common.messages.an_error_occurred')),
                  preset: 'error',
                  haptic: 'error',
                });
              }
            });
          },
          style: 'destructive',
        }
      ]
    );
  }

  if (!session) return null;

  if (loading) {
    return (
      <Skeleton borderRadius={CORNERS} style={[tw`h-10 w-full`, style]} />
    )
  }

  return (
    <Button
    ref={ref}
    onPress={() => {
      isFollow ? unfollowPerson() : followPerson();
      onPress?.();
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
