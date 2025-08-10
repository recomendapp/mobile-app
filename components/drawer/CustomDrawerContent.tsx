import { useAuth } from "@/providers/AuthProvider";
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Link, useRouter } from "expo-router";
import { Alert, Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useMemo } from "react";
import UserAvatar from "@/components/user/UserAvatar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { AuthError } from "@supabase/supabase-js";
import * as Burnt from "burnt";
import { Text } from "../ui/text";
import { View } from "../ui/view";
import { Skeleton } from "../ui/Skeleton";

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const router = useRouter();
    const t = useTranslations();
    const { colors } = useTheme();
    const { session, user, logout } = useAuth();

    const routes = useMemo((): { name: string; icon: React.ElementType; onPress: () => void, visible: boolean, color?: string }[] => {
        return [
            {
                name: upperFirst(t('common.messages.login')),
                icon: Icons.User,
                onPress: async () => {
                    router.push('/auth/login');
                },
                visible: !session,
            },
            {
                name: upperFirst(t('common.messages.upgrade_to_plan', { plan: 'Premium' })),
                icon: Icons.premium,
                onPress: async () => {
                    router.push('/upgrade');
                },
                visible: !!session && !user?.premium,
                color: colors.accentBlue,
            },
            {
                name: upperFirst(t('pages.settings.label')),
                icon: Icons.settings,
                onPress: async () => {
                    router.push('/settings');
                },
                visible: true,
            },
            {
                name: upperFirst(t('common.messages.about')),
                icon: Icons.info,
                onPress: () => {
                    router.push('/about');
                },
                visible: true,
            }
        ];
    }, [t, router, session, user, colors]);

    const closeDrawer = () => {
        props.navigation.closeDrawer();
    };
    const handleLogout = async () => {
        try {
            await logout();
            closeDrawer();
        } catch (error) {
            let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
            if (error instanceof AuthError) {
                errorMessage = upperFirst(t('common.messages.error'));
            }
            Burnt.toast({
                title: upperFirst(t('common.messages.error')),
                message: errorMessage,
                preset: 'error',
                haptic: 'error',
            });
        }
    };
    const handleLogoutButtonPress = () => {
        Alert.alert(
            upperFirst(t('common.messages.are_u_sure')),
            undefined,
            [
                {
                    text: upperFirst(t('common.messages.cancel')),
                    style: 'cancel',
                },
                {
                    text: upperFirst(t('common.messages.logout')),
                    style: 'destructive',
                    onPress: handleLogout,
                },
            ]
        );
    };

    return (
        <SafeAreaView
        style={{
            flex: 1,
            backgroundColor: colors.muted,
        }}
        >
            {/* MAIN ROUTES */}
            <DrawerContentScrollView>
                {session && (
                    <DrawerItem
                        label={() => (
                            <View>
                                {user ? <Text style={tw`text-xl font-semibold`}>{user.full_name}</Text> : <Skeleton style={tw`w-32 h-8`} />}
                                {user ? <Text style={{ color: colors.mutedForeground }}>@{user.username}</Text> : <Skeleton style={tw`w-24 h-5`} />}
                            </View>
                        )}
                        icon={({ color, size }) => (
                            user ? <UserAvatar full_name={user.full_name} avatar_url={user.avatar_url} style={tw`w-16 h-16`} /> : <UserAvatar skeleton style={tw`w-16 h-16`} />
                        )}
                        onPress={() => {
                            if (!user) return;
                            router.push(`/user/${user.username}`);
                            closeDrawer();
                        }}
                    />
                )}
                {routes.filter(route => route.visible).map((route, index) => (
                    <DrawerItem
                    key={index}
                    label={route.name}
                    labelStyle={{ color: route.color || colors.foreground }}
                    icon={({ color, size }) => (
                        <route.icon color={route.color ||colors.foreground} size={size} />
                    )}
                    onPress={() => {
                        route.onPress();
                        closeDrawer();
                    }}
                    />
                ))}
            </DrawerContentScrollView>
            {/* FOOTER */}
            <DrawerItem
            label={upperFirst(t('common.messages.logout'))}
            activeTintColor={colors.destructive}
            inactiveTintColor={colors.destructive}
            icon={() => <Icons.logout color={colors.destructive} />}
            onPress={handleLogoutButtonPress}
            />
        </SafeAreaView>
    );
}

export default CustomDrawerContent;