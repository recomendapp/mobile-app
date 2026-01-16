import { authKeys } from "@/api/auth/authKeys";
import { authCustomerInfoOptions } from "@/api/auth/authOptions";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import Animated, { FadeInDown, FadeOut, ZoomIn } from "react-native-reanimated"; // Imports d'animation
import { useTranslations } from "use-intl";
import * as Haptics from "expo-haptics"; // Pour la vibration

const PremiumSuccess = ({ onClose } : { onClose: () => void }) => {
	const { colors } = useTheme();
	const t = useTranslations();

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <Animated.View 
            style={tw`flex-1 justify-center items-center gap-4 bg-background px-6`}
            exiting={FadeOut.duration(300)}
        >
            <Animated.View entering={ZoomIn.springify().damping(12)}>
                <Icons.Star 
				size={64} 
				color={colors.accentYellow}
				fill={colors.accentYellow}
                />
            </Animated.View>

            <Animated.Text 
                entering={FadeInDown.duration(600).springify()}
                style={[
					{ color: colors.foreground },
					tw`text-3xl font-bold text-center mb-4`
				]}
            >
                {upperFirst(t('pages.upgrade.subscription.success.description'))}
            </Animated.Text>

            <Animated.Text 
                entering={FadeInDown.delay(300).duration(600).springify()}
                style={tw`text-lg text-muted-foreground text-center leading-6`}
            >
                Thanks for supporting the project and unlocking full access.
            </Animated.Text>
        </Animated.View>
    )
};

const UpgradeScreen = () => {
    const { session } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const t = useTranslations();
    const { defaultScreenOptions, isLiquidGlassAvailable } = useTheme();
    
    const [isSuccess, setIsSuccess] = useState(false);
    
    const handleClose = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    }, [router]);

    const onSuccess = useCallback(async ({ customerInfo } : { customerInfo: CustomerInfo }) => {
        queryClient.setQueryData(authCustomerInfoOptions().queryKey, customerInfo);
        session?.user.id && await queryClient.invalidateQueries({
            queryKey: authKeys.user(),
        });
        
        setIsSuccess(true);
    }, [queryClient, session?.user.id]);

    if (!session) return <Redirect href={'/auth/login'} />
    
    return (
    <>
        <Stack.Screen
            options={{
                ...defaultScreenOptions,
                headerTitle: upperFirst(t('common.messages.upgrade')),
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
                headerLeft: () => (
                    <Button variant="muted" icon={Icons.X} size="icon" style={tw`rounded-full`} onPress={handleClose} />
                ),
                unstable_headerLeftItems: isLiquidGlassAvailable ? (props) => [
                {
                    type: "button",
                    label: upperFirst(t('common.messages.close')),
                    onPress: handleClose,
                    icon: {
                        name: "xmark",
                        type: "sfSymbol",
                    },
                },
                ] : undefined,
            }}
        />
        
        <Animated.View style={tw`flex-1 bg-background`}>
            {isSuccess ? (
                <PremiumSuccess onClose={handleClose} />
            ) : (
                <RevenueCatUI.Paywall 
                    onPurchaseCompleted={onSuccess} 
                    onRestoreCompleted={onSuccess} 
                />
            )}
        </Animated.View>
    </>
    )
};

export default UpgradeScreen;