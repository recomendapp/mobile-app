import { Skeleton } from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import tw from '@/lib/tw';
import { CORNERS } from '@/theme/globals';
import { forwardRef, useMemo } from 'react';

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

const UserAvatar = forwardRef<
	React.ComponentRef<typeof Avatar.Root>,
	UserAvatarProps
>(({ full_name, avatar_url, skeleton, style, ...props }, ref) => {
	const skeletonStyle = useMemo(() => [
		tw.style('h-12 w-12'),
		style,
	], [style]);

	const imageSource = useMemo(() => ({ 
		uri: avatar_url ?? '' 
	}), [avatar_url]);

	if (skeleton) {
		return (
			<Skeleton
				borderRadius={CORNERS}
				style={skeletonStyle}
			/>
		);
	}
	
	return (
		<Avatar.Root
			ref={ref}
			alt={full_name}
			style={style}
			{...props}
		>
			<Avatar.Image source={imageSource} />
			<Avatar.Fallback />
		</Avatar.Root>
	);
});
UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;