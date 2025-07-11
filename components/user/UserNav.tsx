import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import UserAvatar from "./UserAvatar";

export const UserNav = () => {
	const navigation = useNavigation();
	const { session, user } = useAuth();
	if (!session) return null;
	if (!user) {
		return <Skeleton className='h-12 w-12 rounded-full' />
	}
	return (
		<TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
			<UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} />
		</TouchableOpacity>
	)
};