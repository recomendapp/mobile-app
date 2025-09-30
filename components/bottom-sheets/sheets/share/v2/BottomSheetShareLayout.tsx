import { forwardRef, useState } from "react";
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
import * as Burnt from 'burnt';
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { ShareViewRef } from "@/components/share/type";
import { LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

type SharePlatform = {
	label: string;
	icon: LucideIcon;
	onPress: () => Promise<void>;
}

interface BottomSheetShareLayoutProps extends React.ComponentPropsWithRef<typeof ScrollView> {
    path: string;
    contentRef: React.RefObject<ShareViewRef | null>;
    children: React.ReactNode;
}

const BottomSheetShareLayout = forwardRef<
    React.ComponentRef<typeof ScrollView>,
    BottomSheetShareLayoutProps
>(({
    path,
    contentRef,
    children,
    style,
    contentContainerStyle,
    ...props
}, ref) => {
    const { colors } = useTheme();
    const t = useTranslations();
    const url = `https://${Constants.expoConfig?.extra?.webDomain}${path}`;
    
    // REFs
    const [loadingPlatform, setLoadingPlatform] = useState<number | null>(null);

    const sharePlatform: SharePlatform[] = [
        {
            label: "Copier le lien",
            icon: Icons.link,
            onPress: async () => {
                await Clipboard.setStringAsync(url);
                Burnt.toast({
                    title: upperFirst(t('common.messages.copied', { count: 1, gender: 'male' })),
                    preset: 'done',
                });
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
            label: "More",
            icon: Icons.EllipsisHorizontal,
            onPress: async () => {
                await Share.open({
                    url: url,
                })
            }
        }
    ];

    // Handlers
    const handlePlatformPress = (item: SharePlatform, index: number) => async () => {
        setLoadingPlatform(index);
        try {
            await item.onPress();
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setLoadingPlatform(null);
        }
    };

    return (
    <>
        <Stack.Screen options={{ headerStyle: { backgroundColor: colors.muted } }} />
        <ScrollView
        ref={ref}
        bounces={false}
        contentContainerStyle={[
            {
                gap: GAP,
            },
            contentContainerStyle
        ]}
        style={[
            {
                backgroundColor: colors.muted,
            },
            style
        ]}
        {...props}
        >
            {children}
            {children && <Separator />}
            <LegendList
            data={sharePlatform}
            renderItem={({ item, index }) => (
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
            )}
            contentContainerStyle={{
                paddingHorizontal: PADDING_HORIZONTAL,
                gap: GAP,
            }}
            keyExtractor={item => item.label}
            horizontal
            showsHorizontalScrollIndicator={false}
            />
        </ScrollView>
    </>
    );
});

BottomSheetShareLayout.displayName = "BottomSheetShareLayout";

export default BottomSheetShareLayout;