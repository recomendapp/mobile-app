import * as React from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

interface UserAvatarProps extends Omit<React.ComponentPropsWithRef<typeof View>, 'alt'> {
	full_name?: string | null;
	avatar_url?: string | null;
	skeleton?: boolean;
}

const UserAvatar = React.forwardRef<
	React.ElementRef<typeof View>,
	UserAvatarProps
>(({ full_name, avatar_url, skeleton, style, ...props }, ref) => {
	if (!full_name || skeleton) {
		return (
			<Skeleton className={cn('h-12 w-12 rounded-full', props.className)} />
		)
	}
	return (
		<View
		ref={ref}
		style={[
			{ width: 48, height: 48, borderRadius: 24 },
			style,
		]}
		{...props}
		/>
		// <Avatar ref={ref} alt={full_name} {...props}>
		// 	<AvatarImage source={{ uri: avatar_url ?? '' }}/>
		// 	<AvatarFallback>
		// 		<ThemedText>{full_name}</ThemedText>
		// 	</AvatarFallback>
		// </Avatar>
	)
});
UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;