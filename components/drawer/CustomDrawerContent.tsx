import { useAuth } from "@/context/AuthProvider";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Link, useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";
import { Icons } from "@/constants/Icons";
import { useMemo } from "react";
import UserAvatar from "@/components/user/UserAvatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomDrawerContent = (props: any) => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const routes = useMemo(() => {
        return [
            {
                name: 'Settings',
                icon: Icons.settings,
                onPress: async () => {
                    router.push('/settings/profile');
                }
            },
            {
                name: 'About',
                icon: Icons.info,
                onPress: () => {
                    router.push('/about');
                }
            }
        ];
    }, []);

    const closeDrawer = () => {
        props.navigation.closeDrawer();
    }

    if (!user) return null;

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-muted">
            {/* MAIN ROUTES */}
            <DrawerContentScrollView {...props}>
                {/* <DrawerItemList {...props} /> */}
                {/* PROFILE */}
                <Link href={`/user/${user.username}`} asChild>
                    <Pressable className="flex-row items-center p-4 gap-2">
                        <UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} className="w-16 h-16"/>
                        <View>
                            <ThemedText className="text-xl font-semibold">{user.full_name}</ThemedText>
                            <ThemedText className="text-md text-muted-foreground">@{user.username}</ThemedText>
                        </View>
                    </Pressable>
                </Link>
                {routes.map((route, index) => (
                    <DrawerItem
                    key={index}
                    label={route.name}
                    icon={({ color, size }) => (
                        <route.icon color={color} size={size} />
                    )}
                    onPress={() => {
                        route.onPress();
                        closeDrawer();
                    }}
                    />
                ))}
            </DrawerContentScrollView>
            {/* FOOTER */}
            <SafeAreaView>
                <Pressable
                onPress={async () => {
                    await logout();
                    closeDrawer();
                }}
                className="px-4"
                >
                    <Text className="text-destructive">Logout</Text>
                </Pressable>
            </SafeAreaView>
        </SafeAreaView>
    );
}

export default CustomDrawerContent;