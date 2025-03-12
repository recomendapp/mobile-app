import * as React from 'react';
import { Skeleton } from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import tw from '@/lib/tw';

interface UserAvatarProps extends Omit<React.ComponentPropsWithRef<typeof Avatar.Root>, 'alt'> {
	full_name?: string | null;
	avatar_url?: string | null;
	skeleton?: boolean;
}

const UserAvatar = React.forwardRef<
	React.ElementRef<typeof Avatar.Root>,
	UserAvatarProps
>(({ full_name, avatar_url, skeleton, style, ...props }, ref) => {
	if (!full_name || skeleton) {
		return (
			<Skeleton
			style={[
				tw.style('h-12 w-12 rounded-full'),
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