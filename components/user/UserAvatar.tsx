import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface UserAvatarProps extends Omit<React.ComponentPropsWithRef<typeof Avatar>, 'alt'> {
	full_name?: string | null;
	avatar_url?: string | null;
	skeleton?: boolean;
}

const UserAvatar = React.forwardRef<
	React.ElementRef<typeof Avatar>,
	UserAvatarProps
>(({ full_name, avatar_url, skeleton, ...props }, ref) => {
	if (!full_name || skeleton) {
		return (
			<Skeleton className={cn('h-12 w-12 rounded-full', props.className)} />
		)
	}
	return (
		<Avatar ref={ref} alt={full_name} {...props}>
			<AvatarImage source={{ uri: avatar_url ?? '' }}/>
			<AvatarFallback>
				<ThemedText>{full_name}</ThemedText>
			</AvatarFallback>
		</Avatar>
	)
});

export default UserAvatar;