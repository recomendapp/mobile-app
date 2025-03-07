import { useAuth } from "@/context/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemedText } from "@/components/ui/ThemedText";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

export const UserNav = () => {
	const navigation = useNavigation();
	const { session, user } = useAuth();
	if (!session) return null;
	if (!user) {
		return <Skeleton className='h-12 w-12 rounded-full' />
	}
	return (
		<TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
			<Avatar alt={user?.full_name}>
				<AvatarImage source={{ uri: user?.avatar_url ?? '' }}/>
				<AvatarFallback>
					<ThemedText>{user?.full_name}</ThemedText>
				</AvatarFallback>
			</Avatar>
		</TouchableOpacity>
	)
};