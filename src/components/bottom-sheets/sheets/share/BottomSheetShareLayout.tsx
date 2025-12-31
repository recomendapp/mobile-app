import { forwardRef, useCallback, useMemo, useState } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import TrueSheet from "@/components/ui/TrueSheet";
import tw from "@/lib/tw";
import Share, { Social } from "react-native-share"
import Constants from 'expo-constants';
import { Text } from "@/components/ui/text";
import { GAP, GAP_XL, GAP_XS, HEIGHT, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/constants/Icons";
import * as Clipboard from 'expo-clipboard';
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { ShareViewRef } from "@/components/share/type";
import { LucideIcon, LucideProps } from "lucide-react-native";
import { useToast } from "@/components/Toast";
import { View } from "@/components/ui/view";
import { BrandIcon, BrandIconProps } from "@/lib/icons";
import { useTheme } from "@/providers/ThemeProvider";
import { Platform, ScrollView } from "react-native";
import * as env from '@/env';
import * as MediaLibrary from 'expo-media-library';
import { File, Directory, Paths } from 'expo-file-system';
import { FlashList } from "@shopify/flash-list";

const SHARE_DIRECTORY = new Directory(Paths.cache, 'share_temp');

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
    const url = `https://${Constants.expoConfig?.extra?.webDomain}${path}`;
    
    // REFs
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
                    appId: env.FACEBOOK_APP_ID,
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
                    appId: env.FACEBOOK_APP_ID,
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
                    appId: env.FACEBOOK_APP_ID,
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
                    appId: env.FACEBOOK_APP_ID,
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
                    appId: env.FACEBOOK_APP_ID,
                    title: "Recomend",
                    url: url,
                });
            }
        },
        {
            label: upperFirst(t('common.messages.download')),
            icon: { component: Icons.Download, props: { color: colors.foreground } },
            onPress: async () => {
                let downloaded = 0;
                const data = await contentRef.current?.capture();
                if (!data) return;

                const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync(true);
                if (status !== 'granted' && canAskAgain) {
                    const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
                    if (newStatus !== 'granted') {
                        toast.error(upperFirst(t('common.messages.photo_library_permission_denied')));
                        return;
                    }
                } else if (status !== 'granted' && !canAskAgain) {
                    toast.error(upperFirst(t('common.messages.photo_library_permission_denied')));
                    return;
                }

               const saveTempImage = async (uri: string, name: string) => {
                    if (!uri) return;

                    if (!SHARE_DIRECTORY.exists) {
                        SHARE_DIRECTORY.create({ intermediates: true });
                    }
                    const entries = SHARE_DIRECTORY.list();
                    entries.forEach(entry => {
                        console.log(`- ${entry.name} (isFile: ${entry instanceof File})`);
                        if (entry instanceof File) {
                            entry.delete();
                        }
                    });

                    if (uri.startsWith('data:image')) {
                        const matches = uri.match(/data:image\/(\w+);base64,/);
                        const extension = matches ? matches[1] : 'png';
                        
                        const fileName = `share_temp_${name}_${Date.now()}.${extension}`;
                        const file = new File(SHARE_DIRECTORY, fileName);
                    
                        const base64Data = uri.split(',')[1];
                        const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                        file.write(bytes);                        
                        await MediaLibrary.saveToLibraryAsync(file.uri);
                        file.delete();
                    } else {
                        await MediaLibrary.saveToLibraryAsync(uri);
                    }
                };

                if (data.sticker) {
                    await saveTempImage(data.sticker, 'sticker');
                    downloaded += 1;
                }
                if (data.backgroundImage) {
                    await saveTempImage(data.backgroundImage, 'backgroundImage');
                    downloaded += 1;
                }

                toast.success(upperFirst(t('common.messages.downloaded', { count: downloaded, gender: 'female' })));
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
    ]), [colors, mode, contentRef, url, t, toast]);

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
        <TrueSheet
        ref={ref}
        // scrollable={Platform.OS === 'ios' ? true : false}
        {...props}
        >
            <ScrollView
            bounces={false}
            contentContainerStyle={{ gap: GAP, paddingTop: PADDING_VERTICAL * 2 }}
            nestedScrollEnabled
            >
                <Text variant="title" style={tw`text-center`}>{upperFirst(t('common.messages.share'))}</Text>
                {children}
                {children && <Separator />}

                <FlashList
                data={sharePlatform}
                renderItem={renderItem}
                extraData={loadingPlatform}
                contentContainerStyle={{
                    paddingHorizontal: PADDING_HORIZONTAL * 2,
                }}
                ItemSeparatorComponent={() => <View style={{ width: GAP_XL }}/>}
                keyExtractor={useCallback((item: SharePlatform, index: number) => index.toString(), [])}
                horizontal
                showsHorizontalScrollIndicator={false}
                />
            </ScrollView>
        </TrueSheet>
    );
});

BottomSheetShareLayout.displayName = "BottomSheetShareLayout";

export default BottomSheetShareLayout;