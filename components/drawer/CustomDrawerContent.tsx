import { useAuth } from "@/context/AuthProvider";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Link, useRouter } from "expo-router";
import { Linking, Pressable, SafeAreaView, View, Text } from "react-native";
import { ThemedText } from "../ui/ThemedText";
import { Button } from "../ui/button";
import { Icons } from "@/constants/Icons";
import { useMemo } from "react";

const CustomDrawerContent = (props: any) => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const routes = useMemo(() => {
        return [
            {
                name: 'Profile',
                icon: Icons.user,
                onPress: () => {
                    router.push('/collection');
                }
            },
            {
                name: 'Settings',
                icon: Icons.settings,
                onPress: async () => {
                    router.push('/collection');
                }
            }
        ];
    }, [user]);

    const closeDrawer = () => {
        props.navigation.closeDrawer();
    }

    return (
        <View style={{ flex: 1 }}>
            {/* MAIN ROUTES */}
            <DrawerContentScrollView {...props}>
                {/* <DrawerItemList {...props} /> */}
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
        </View>
    );
}

export default CustomDrawerContent;