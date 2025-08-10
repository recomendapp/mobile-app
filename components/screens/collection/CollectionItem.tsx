import { upperFirst } from "lodash";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import React, { useCallback } from "react";
import tw from "@/lib/tw";
import { Icons } from "@/constants/Icons";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { LinkProps, useRouter } from "expo-router";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { Pressable } from "react-native-gesture-handler";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Alert } from "react-native";
import { Button } from "@/components/ui/Button";
import * as Burnt from "burnt";
import { Media } from "@/types/type.db";
import { CollectionAction } from "./CollectionScreen";

interface CollectionItemProps<T> extends React.ComponentProps<typeof Animated.View> {
    item: T;
    swipeActions?: CollectionAction<T>[];
    bottomSheetActions?: CollectionAction<T>[];
    renderCustom?: (item: T) => React.ReactNode;
    getItemId: (item: T) => string | number;
	getItemMedia: (item: T) => Media;
    getItemTitle: (item: T) => string;
    getItemSubtitle?: (item: T) => string;
    getItemImageUrl?: (item: T) => string;
    getItemUrl?: (item: T) => string;
}

const CollectionItem = React.forwardRef<
    React.ComponentRef<typeof Animated.View>,
    CollectionItemProps<any>
>(({ style, item, swipeActions, bottomSheetActions, renderCustom, getItemId, getItemMedia, getItemTitle, getItemSubtitle, getItemImageUrl, getItemUrl, ...props }, ref) => {
    const t = useTranslations();
    const router = useRouter();
    const openSheet = useBottomSheetStore((state) => state.openSheet);
    const { colors } = useTheme();

    const handleActionWithConfirmation = useCallback(async (action: CollectionAction<any>, item: any) => {
        if (action.confirmationConfig) {
            const { confirmationConfig } = action;
            Alert.alert(
                confirmationConfig.title,
                confirmationConfig.description,
                [
                    {
                        text: upperFirst(t('common.messages.cancel')),
                        style: 'cancel',
                    },
                    {
                        text: confirmationConfig.confirmText,
                        onPress: async () => {
                            try {
                                await action.onPress(item);
                                Burnt.toast({
                                    title: confirmationConfig.successMessage,
                                    preset: 'done',
                                });
                            } catch (error) {
                                Burnt.toast({
                                    title: upperFirst(t('common.messages.error')),
                                    message: confirmationConfig.errorMessage,
                                    preset: 'error',
                                    haptic: 'error',
                                });
                            }
                        },
                        style: action.variant === 'destructive' ? 'destructive' : 'default',
                    }
                ]
            );
        } else {
            await action.onPress(item);
        }
    }, [t]);

    const handleOpenSheet = useCallback((item: any) => {
        if (!bottomSheetActions?.length) return;

		const additionalItems = bottomSheetActions.map(action => ({
			icon: action.icon,
			label: action.label,
			onPress: () => handleActionWithConfirmation(action, item),
			position: action.position,
		}));

        const mediaData = getItemMedia(item);

        openSheet(BottomSheetMedia, {
            media: mediaData,
			additionalItemsTop: additionalItems.filter(action => action.position === 'top'),
			additionalItemsBottom: additionalItems.filter(action => action.position === 'bottom'),
        });
    }, [bottomSheetActions, handleActionWithConfirmation, openSheet, getItemTitle, getItemImageUrl, getItemUrl]);

    const RightActions = useCallback((prog: SharedValue<number>, drag: SharedValue<number>, item: any, swipeable: SwipeableMethods) => {
        if (!swipeActions?.length) return null;

        const styleAnimation = useAnimatedStyle(() => {
            return {
                transform: [{ translateX: drag.value + 50 * swipeActions.length }],
            };
        });

        return (
            <Animated.View style={[tw`rounded-r-md overflow-hidden flex-row`, styleAnimation]}>
                {swipeActions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant || "default"}
                        icon={action.icon}
                        style={[
                            tw`h-full rounded-none`,
                            { width: 50 },
                        ]}
                        size="icon"
                        onPress={() => {
							swipeable.close();
							handleActionWithConfirmation(action, item)
						}}
                    />
                ))}
            </Animated.View>
        );
    }, [swipeActions, handleActionWithConfirmation]);
    
    // Custom rendering
    if (renderCustom) {
        return renderCustom(item);
    }

	const itemSubtitle = getItemSubtitle?.(item);
    // Default rendering
    const itemContent = (
        <Animated.View
            ref={ref}
            style={[tw`flex-row items-center gap-2`, style]}
            {...props}
        >
			<ImageWithFallback
				alt={getItemTitle?.(item) || ''}
				source={{ uri: getItemImageUrl?.(item) || '' }}
				style={[{ aspectRatio: 2 / 3, height: 'fit-content' }, tw`rounded-md w-16`]}
			/>
			<View style={tw`shrink`}>
				<Text numberOfLines={1}>
					{getItemTitle?.(item) || ''}
				</Text>
				{itemSubtitle && <Text style={{ color: colors.mutedForeground }} numberOfLines={1}>
					{itemSubtitle}
				</Text>}
			</View>
        </Animated.View>
    );
	const pressableContent = (
        <Pressable
            onPress={() => {
                const url = getItemUrl?.(item);
                if (url) router.push(url as LinkProps['href']);
            }}
            onLongPress={() => handleOpenSheet(item)}
			style={tw`flex-1`}
        >
            {itemContent}
        </Pressable>
    );
	const itemWithContainer = (
		<View style={tw`flex-row items-center justify-between gap-2`}>
			{pressableContent}
			<Button
			variant="ghost"
			size="icon"
			icon={Icons.EllipsisHorizontal}
			iconProps={{ color: colors.mutedForeground }}
			onPress={() => handleOpenSheet(item)}
			/>
		</View>
	)

    // If swipe actions are defined, we wrap the content in a Swipeable component
    // if (swipeActions?.length) {
    //     return (
    //         <Swipeable
    //             friction={2}
    //             enableTrackpadTwoFingerGesture
    //             renderRightActions={(prog, drag, swipeable) => RightActions(prog, drag, item, swipeable)}
    //             containerStyle={tw`my-1 px-4`}
    //         >
    //             {itemWithContainer}
    //         </Swipeable>
    //     );
    // }

    // If no swipe actions, we return the content directly
    return (
        <View style={tw`my-1 px-4`}>
            {itemWithContainer}
        </View>
    );
});
CollectionItem.displayName = "CollectionItem";

export {
	CollectionItem
}