import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { GestureResponderEvent, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import UserAvatar from "./UserAvatar";
import { forwardRef, useCallback } from "react";

interface UserNavProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {}

export const UserNav = forwardRef<
	React.ComponentRef<typeof TouchableOpacity>,
	UserNavProps
>(({ onPress, ...props}, ref) => {
	const navigation = useNavigation();
	const { session, user } = useAuth();
	
	const handlePress = useCallback((event: GestureResponderEvent) => {
		navigation.dispatch(DrawerActions.openDrawer());
		onPress?.(event);
	}, [navigation]);
	
	if (!session) return null;
	
	if (!user) {
		return <Skeleton className='h-12 w-12 rounded-full' />
	}
	
	return (
		<TouchableOpacity ref={ref} onPress={handlePress} {...props} >
			<UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} />
		</TouchableOpacity>
	);
});
UserNav.displayName = 'UserNav';