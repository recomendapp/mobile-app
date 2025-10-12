import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ThemedTrueSheet from "@/components/ui/ThemedTrueSheet";
import tw from "@/lib/tw";
import Share, { Social } from "react-native-share"
import Constants from 'expo-constants';
import { Text } from "@/components/ui/text";
import { GAP, GAP_XL, GAP_XS, HEIGHT, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/constants/Icons";
import * as Clipboard from 'expo-clipboard';
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { ShareViewRef } from "@/components/share/type";
import { LucideIcon, LucideProps } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/Toast";
import { View } from "@/components/ui/view";
import { BrandIcon, BrandIconProps } from "@/lib/icons";
import { useTheme } from "@/providers/ThemeProvider";
import { ScrollView } from "react-native";

type SharePlatform = {
	label: string;
    icon:
        | {component: LucideIcon; props?: LucideProps }
        | {component: BrandIcon; props?: BrandIconProps };
	onPress: () => Promise<void>;
}

interface BottomSheetShareLayoutProps extends BottomSheetProps {
    path: string;
    contentRef: React.RefObject<ShareViewRef | null>;
    children?: React.ReactNode;
}

const BottomSheetShareLayout = forwardRef<
    React.ComponentRef<typeof TrueSheet>,
    BottomSheetShareLayoutProps
>(({
    id,
    path,
    contentRef,
    children,
    ...props
}, ref) => {
    const toast = useToast();
    const t = useTranslations();
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const url = `https://${Constants.expoConfig?.extra?.webDomain}${path}`;
    
    // REFs
    const scrollRef = useRef<ScrollView>(null);
    const [loadingPlatform, setLoadingPlatform] = useState<number | null>(null);

    const sharePlatform = useMemo((): SharePlatform[] => ([
        {
            label: upperFirst(t('common.messages.copy_link')),
            icon: { component: Icons.link, props: { color: colors.foreground } },
            onPress: async () => {
                await Clipboard.setStringAsync(url);
                toast.success(upperFirst(t('common.messages.copied', { count: 1, gender: 'male' })));
            }
        },
        {
            label: upperFirst(t('common.messages.story', { count: 2 })),
            icon: { component: Icons.brands.instagram },
            onPress: async () => {
                const data = await contentRef.current?.capture();
                if (!data) return;
                await Share.shareSingle({
                    social: Social.InstagramStories,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    stickerImage: data.sticker,
                    backgroundImage: data.backgroundImage,
                    backgroundTopColor: data.backgroundTopColor,
                    backgroundBottomColor: data.backgroundBottomColor,
                    backgroundVideo: data.backgroundVideo,
                });
            }
        },
        {
            label: "WhatsApp",
            icon: { component: Icons.brands.whatsapp },
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Whatsapp,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    message: '', // Isn't optional
                    url: url,
                });
            }
        },
        {
            label: upperFirst(t('common.messages.message', { count: 2 })),
            icon: { component: Icons.brands.instagram },
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Instagram,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    message: url,
                });
            }
        },
        {
            label: "X",
            icon: { component: Icons.brands.x, props: { variant: mode }},
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Twitter,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        {
            label: "Messenger",
            icon: { component: Icons.brands.messenger },
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Messenger,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        {
            label: "Flux",
            icon: { component: Icons.brands.facebook },
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Facebook,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        {
            label: upperFirst(t('common.messages.more')),
            icon: { component: Icons.EllipsisHorizontal, props: { color: colors.foreground } },
            onPress: async () => {
                await Share.open({
                    url: url,
                    title: "Recomend",
                    failOnCancel: false,
                })
            }
        }
    ]), [colors, mode, mode, contentRef, url, t, toast]);

    // Handlers
    const handlePlatformPress = useCallback((item: SharePlatform, index: number) => async () => {
        setLoadingPlatform(index);
        try {
            await item.onPress();
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setLoadingPlatform(null);
        }
    }, []);

    const renderItem = useCallback(({ item, index }: { item: SharePlatform, index: number }) => (
        <Button
        variant="ghost"
        size='fit'
        onPress={handlePlatformPress(item, index)}
        loading={loadingPlatform === index}
        >
            <View style={[tw`items-center justify-center`, { gap: GAP_XS }]}>
                <item.icon.component width={HEIGHT} height={HEIGHT} {...item.icon.props} />
                <Text style={tw`mt-1 text-sm`}>{item.label}</Text>
            </View>
        </Button>
    ), [handlePlatformPress, loadingPlatform]);

    return (
        <ThemedTrueSheet
        ref={ref}
        scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
        contentContainerStyle={tw`p-0`}
        {...props}
        >
            <ScrollView
            ref={scrollRef}
            bounces={false}
            contentContainerStyle={{ paddingTop: PADDING_VERTICAL * 2, paddingBottom: insets.bottom, gap: GAP }}
            >
                <Text variant="title" style={tw`text-center`}>{upperFirst(t('common.messages.share'))}</Text>
                {children}
                {children && <Separator />}
                <LegendList
				data={sharePlatform}
				renderItem={renderItem}
				contentContainerStyle={{
					paddingHorizontal: PADDING_HORIZONTAL,
					gap: GAP_XL,
				}}
                keyExtractor={useCallback((item: SharePlatform, index: number) => index.toString(), [])}
				horizontal
				showsHorizontalScrollIndicator={false}
                />
            </ScrollView>
        </ThemedTrueSheet>
    );
});

BottomSheetShareLayout.displayName = "BottomSheetShareLayout";

export default BottomSheetShareLayout;