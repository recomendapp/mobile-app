import * as React from 'react';
import { Skeleton } from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import tw from '@/lib/tw';
import { CORNERS } from '@/theme/globals';

interface UserAvatarBaseProps
	extends Omit<React.ComponentPropsWithRef<typeof Avatar.Root>, 'alt'> {
		alt?: string;
		avatar_url?: string | null;
	}

type UserAvatarSkeletonProps = {
	skeleton: true;
	full_name?: never;
};

type UserAvatarDataProps = {
	skeleton?: false;
	full_name: string;
};

export type UserAvatarProps = UserAvatarBaseProps &
	(UserAvatarSkeletonProps | UserAvatarDataProps);

const UserAvatar = React.forwardRef<
	React.ComponentRef<typeof Avatar.Root>,
	UserAvatarProps
>(({ full_name, avatar_url, skeleton, style, ...props }, ref) => {
	if (skeleton) {
		return (
			<Skeleton
			borderRadius={CORNERS}
			style={[
				tw.style('h-12 w-12'),
				style,
			]}
			/>
		)
	}
	return (
		<Avatar.Root
		ref={ref}
		alt={full_name}
		style={[style]}
		{...props}
		>
			<Avatar.Image source={{ uri: avatar_url ?? '' }}/>
			<Avatar.Fallback />
		</Avatar.Root>
	)
});
UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;