import { useAuth } from "@/providers/AuthProvider";
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Icons } from "@/constants/Icons";
import { useCallback, useMemo, memo } from "react";
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

type Route = {
    name: string;
    icon: React.ElementType;
    onPress: () => void;
    visible: boolean;
    color?: string;
}

const ProfileHeader = memo(({
    closeDrawer,
}: {
    closeDrawer: () => void;
}) => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const t = useTranslations();
    
    const handleProfilePress = useCallback(() => {
        if (!user) return;
        router.push(`/user/${user.username}`);
        closeDrawer();
    }, [user, router, closeDrawer]);

    return (
        <DrawerItem
            label={() => (
                <View>
                    {user ? (
                        <Text style={tw`text-xl font-semibold`}>{user.full_name}</Text>
                    ) : (
                        <Skeleton style={tw`w-32 h-8`} />
                    )}
                    {user ? (
                        <Text style={{ color: colors.mutedForeground }}>
                            {upperFirst(t('common.messages.view_profile'))}
                        </Text>
                    ) : (
                        <Skeleton style={tw`w-24 h-5`} />
                    )}
                </View>
            )}
            icon={() => (
                user ? (
                    <UserAvatar 
                        full_name={user.full_name} 
                        avatar_url={user.avatar_url} 
                        style={tw`w-16 h-16`} 
                    />
                ) : (
                    <UserAvatar skeleton style={tw`w-16 h-16`} />
                )
            )}
            onPress={handleProfilePress}
        />
    );
});
ProfileHeader.displayName = 'ProfileHeader';

const RouteItem = memo(({ 
    route, 
    closeDrawer 
}: { 
    route: Route; 
    closeDrawer: () => void; 
}) => {
    const { colors } = useTheme();
    
    const handlePress = useCallback(() => {
        route.onPress();
        closeDrawer();
    }, [route.onPress, closeDrawer]);

    return (
        <DrawerItem
            label={route.name}
            labelStyle={{ color: route.color || colors.foreground }}
            icon={({ size }) => (
                <route.icon color={route.color || colors.foreground} size={size} />
            )}
            onPress={handlePress}
        />
    );
});
RouteItem.displayName = 'RouteItem';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const router = useRouter();
    const t = useTranslations();
    const { colors } = useTheme();
    const { session, user, logout } = useAuth();

    const routes = useMemo(() => [
        {
            id: 'login',
            name: upperFirst(t('common.messages.login')),
            icon: Icons.User,
            onPress: () => router.push('/auth/login'),
            visible: !session,
        },
        {
            id: 'upgrade',
            name: upperFirst(t('common.messages.upgrade_to_plan', { plan: 'Premium' })),
            icon: Icons.premium,
            onPress: () => router.push('/upgrade'),
            visible: !!session && !user?.premium,
            color: colors.accentBlue,
        },
        {
            id: 'settings',
            name: upperFirst(t('pages.settings.label')),
            icon: Icons.settings,
            onPress: () => router.push('/settings'),
            visible: true,
        },
        {
            id: 'about',
            name: upperFirst(t('common.messages.about')),
            icon: Icons.info,
            onPress: () => router.push('/about'),
            visible: true,
        }
    ], [t, router, session, user?.premium, colors.accentBlue]);

    const visibleRoutes = useMemo(
        () => routes.filter(route => route.visible),
        [routes]
    );

    const closeDrawer = useCallback(() => {
        props.navigation.closeDrawer();
    }, [props.navigation]);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            closeDrawer();
        } catch (error) {
            let errorMessage = upperFirst(t('common.messages.an_error_occurred'));
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
    }, [logout, closeDrawer, t]);

    const handleLogoutButtonPress = useCallback(() => {
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
    }, [handleLogout, t]);

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.muted,
            }}
        >
            <DrawerContentScrollView>
                {session && (
                    <ProfileHeader closeDrawer={closeDrawer} />
                )}
                {visibleRoutes.map((route) => (
                    <RouteItem 
                    key={route.id}
                    route={route} 
                    closeDrawer={closeDrawer} 
                    />
                ))}
            </DrawerContentScrollView>

            {session && (
                <DrawerItem
                    label={upperFirst(t('common.messages.logout'))}
                    activeTintColor={colors.destructive}
                    inactiveTintColor={colors.destructive}
                    icon={() => <Icons.logout color={colors.destructive} />}
                    onPress={handleLogoutButtonPress}
                />
            )}
        </SafeAreaView>
    );
};

export default CustomDrawerContent;