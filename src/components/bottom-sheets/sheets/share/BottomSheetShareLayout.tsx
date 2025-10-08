import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ThemedTrueSheet from "@/components/ui/ThemedTrueSheet";
import tw from "@/lib/tw";
import Share, { Social } from "react-native-share"
import Constants from 'expo-constants';
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@/components/ui/text";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/constants/Icons";
import * as Clipboard from 'expo-clipboard';
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { ShareViewRef } from "@/components/share/type";
import { LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/Toast";

type SharePlatform = {
	label: string;
	icon: LucideIcon;
	onPress: () => Promise<void>;
}

interface BottomSheetShareLayoutProps extends BottomSheetProps {
    path: string;
    contentRef: React.RefObject<ShareViewRef | null>;
    children: React.ReactNode;
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
    const insets = useSafeAreaInsets();
    const url = `https://${Constants.expoConfig?.extra?.webDomain}${path}`;
    
    // REFs
    const scrollRef = useRef<ScrollView>(null);
    const [loadingPlatform, setLoadingPlatform] = useState<number | null>(null);

    const sharePlatform = useMemo((): SharePlatform[] => ([
        {
            label: "Copier le lien",
            icon: Icons.link,
            onPress: async () => {
                await Clipboard.setStringAsync(url);
                toast.success(upperFirst(t('common.messages.copied', { count: 1, gender: 'male' })));
            }
        },
        {
            label: "Stories",
            icon: Icons.shop,
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
            icon: Icons.settings,
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Whatsapp,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        {
            label: "Messenger",
            icon: Icons.settings,
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Messenger,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        // {
        //     label: "Snapchat",
        //     icon: Icons.shop,
        //     onPress: async () => {
        //         const data = await contentRef.current?.capture();
        //         if (!data) return;
        //         console.log('Sharing to Snapchat with data:', data);
        //         await Share.shareSingle({
        //             social: Social.Snapchat,
        //             appId: process.env.EXPO_PUBLIC_SNAPCHAT_CLIENT_ID!,
        //             title: "Recomend",
        //             url: url,
        //         });
        //     }
        // },
        {
            label: "Flux",
            icon: Icons.Reco,
            onPress: async () => {
                await Share.shareSingle({
                    social: Social.Facebook,
                    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        // {
        //     label: "Stories",
        //     icon: Icons.Reco,
        //     onPress: async () => {
        //         const data = await contentRef.current?.capture();
        //         if (!data) return;
        //         await Share.shareSingle({
        //             social: Social.FacebookStories,
        //             appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
        //             title: "Recomend",
        //             stickerImage: data.sticker,
        //             backgroundImage: data.backgroundImage,
        //             backgroundTopColor: data.backgroundTopColor,
        //             backgroundBottomColor: data.backgroundBottomColor,
        //             backgroundVideo: data.backgroundVideo,
        //         });
        //     }
        // },
        {
            label: "More",
            icon: Icons.EllipsisHorizontal,
            onPress: async () => {
                const data = await contentRef.current?.capture();
                await Share.open({
                    url: url,
                    message: url,
                    title: "Recomend",
                    ...(data ? { url: data.sticker } : {}),
                })
            }
        }
    ]), [contentRef, url, t, toast]);

    // Handlers
    const handlePlatformPress = useCallback((item: SharePlatform, index: number) => async () => {
        setLoadingPlatform(index);
        try {
            console.log('Sharing via:', item.label);
            await item.onPress();
            console.log('Share successful via:', item.label);
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setLoadingPlatform(null);
        }
    }, []);

    const renderItem = useCallback(({ item, index }: { item: SharePlatform, index: number }) => (
        <Button
            variant="outline"
            icon={item.icon}
            size="lg"
            style={tw`rounded-full`}
            loading={loadingPlatform === index}
            onPress={handlePlatformPress(item, index)}
        >
            {item.label}
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
					gap: GAP,
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