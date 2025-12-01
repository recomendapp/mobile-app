import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { GestureResponderEvent, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import UserAvatar from "./UserAvatar";
import { forwardRef, useCallback } from "react";

export const UserNav = forwardRef<
	React.ComponentRef<typeof TouchableOpacity>,
	React.ComponentPropsWithoutRef<typeof TouchableOpacity>
>(({ onPress, onLongPress, ...props}, ref) => {
	const router = useRouter();
	const { session, user } = useAuth();
	
	const handlePress = useCallback((event: GestureResponderEvent) => {
		if (!user?.username) return;
		router.push({ pathname: '/user/[username]', params: { username: user.username }});
		onPress?.(event);
	}, [onPress, router, user?.username]);

	const handleLongPress = useCallback((event: GestureResponderEvent) => {
		router.push({ pathname: '/settings' });
		onLongPress?.(event);
	}, [onLongPress, router]);

	if (!session) return null;
	
	if (!user) {
		return <Skeleton className='h-12 w-12 rounded-full' />
	}
	
	return (
		<TouchableOpacity ref={ref} onPress={handlePress} onLongPress={handleLongPress} {...props} >
			<UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} />
		</TouchableOpacity>
	);
});
UserNav.displayName = 'UserNav';