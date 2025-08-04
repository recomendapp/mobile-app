import { useAuth } from "@/providers/AuthProvider";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Link, useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";
import { Icons } from "@/constants/Icons";
import { useMemo } from "react";
import UserAvatar from "@/components/user/UserAvatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const CustomDrawerContent = (props: any) => {
    const router = useRouter();
    const t = useTranslations();
    const { colors } = useTheme();
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
        <SafeAreaView
        style={{
            flex: 1,
            backgroundColor: colors.muted,
        }}
        >
            {/* MAIN ROUTES */}
            <DrawerContentScrollView>
                {/* <DrawerItemList {...props} /> */}
                {/* PROFILE */}
                <Link href={`/user/${user.username}`} asChild>
                    <Pressable style={tw.style("flex-row items-center p-4 gap-2")}>
                        <UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} style={tw.style("w-16 h-16")} />
                        <View>
                            <ThemedText style={tw.style("text-xl font-semibold")}>{user.full_name}</ThemedText>
                            <ThemedText style={{ color: colors.mutedForeground }}>@{user.username}</ThemedText>
                        </View>
                    </Pressable>
                </Link>
                {routes.map((route, index) => (
                    <DrawerItem
                    key={index}
                    label={route.name}
                    labelStyle={{ color: colors.foreground }}
                    icon={({ color, size }) => (
                        <route.icon color={colors.foreground} size={size} />
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
                style={tw.style("px-4")}
                >
                    <Text style={{ color: colors.destructive }}>{upperFirst(t('common.messages.logout'))}</Text>
                </Pressable>
            </SafeAreaView>
        </SafeAreaView>
    );
}

export default CustomDrawerContent;