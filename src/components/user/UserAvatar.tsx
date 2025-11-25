import { Skeleton } from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import { CORNERS } from '@/theme/globals';
import { forwardRef } from 'react';
import { ViewProps } from 'react-native';
import { ImageSource } from 'expo-image';

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
	const baseStyle: ViewProps['style'] = [
		{ height: 'auto', width: 40, aspectRatio: 1 / 1 },
		style,
	];

	const imageSource: ImageSource = { 
		uri: avatar_url ?? '' 
	};

	if (skeleton) {
		return (
			<Skeleton
			borderRadius={CORNERS}
			style={baseStyle}
			/>
		);
	}
	
	return (
		<Avatar.Root
		ref={ref}
		alt={full_name}
		style={baseStyle}
		{...props}
		>
			<Avatar.Image source={imageSource} />
			<Avatar.Fallback />
		</Avatar.Root>
	);
});
UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;