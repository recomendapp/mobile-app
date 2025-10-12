import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { Icons } from "@/constants/Icons";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { LinkProps, useRouter } from "expo-router";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Button } from "@/components/ui/Button";
import { CollectionAction } from "./CollectionScreen";
import { forwardRef, useCallback } from "react";
import { MediaType, ViewType } from "@recomendapp/types";
import { Pressable } from "react-native";

interface CollectionItemProps<T> extends React.ComponentProps<typeof Animated.View> {
    item: T;
    swipeActions?: CollectionAction<T>[];
    bottomSheetActions?: CollectionAction<T>[];
    renderCustom?: (item: T) => React.ReactNode;
    getItemId: (item: T) => string | number;
    getItemTitle: (item: T) => string;
    getItemSubtitle?: (item: T) => string;
    getItemImageUrl?: (item: T) => string;
    getItemUrl?: (item: T) => string;
    onItemAction?: (item: T) => void;
    view?: ViewType;
    type?: MediaType;
    index: number;
}

const CollectionItem = forwardRef<
    React.ComponentRef<typeof Animated.View>,
    CollectionItemProps<any>
>(({ style, item, swipeActions, bottomSheetActions, renderCustom, getItemId, getItemTitle, getItemSubtitle, getItemImageUrl, getItemUrl, onItemAction, view = 'list', type, index, ...props }, ref) => {
    const t = useTranslations();
    const router = useRouter();
    const { colors } = useTheme();

    // const RightActions = useCallback((prog: SharedValue<number>, drag: SharedValue<number>, item: any, swipeable: SwipeableMethods) => {
    //     if (!swipeActions?.length) return null;

    //     const styleAnimation = useAnimatedStyle(() => {
    //         return {
    //             transform: [{ translateX: drag.value + 50 * swipeActions.length }],
    //         };
    //     });

    //     return (
    //         <Animated.View style={[tw`rounded-r-md overflow-hidden flex-row`, styleAnimation]}>
    //             {swipeActions.map((action, index) => (
    //                 <Button
    //                     key={index}
    //                     variant={action.variant || "default"}
    //                     icon={action.icon}
    //                     style={[
    //                         tw`h-full rounded-none`,
    //                         { width: 50 },
    //                     ]}
    //                     size="icon"
    //                     onPress={() => {
	// 						swipeable.close();
	// 						handleActionWithConfirmation(action, item)
	// 					}}
    //                 />
    //             ))}
    //         </Animated.View>
    //     );
    // }, [swipeActions, handleActionWithConfirmation]);
    
    // Custom rendering
    if (renderCustom) {
        return renderCustom(item);
    }

	const itemSubtitle = getItemSubtitle?.(item);
    // Default rendering
    const itemContent = useCallback(() => {
        switch (view) {
            case 'grid':
                return (
                    <Animated.View
                    ref={ref}
                    style={[tw`relative flex items-center w-full aspect-2/3`, style]}
                    {...props}
                    >
                        <ImageWithFallback
                        alt={getItemTitle?.(item) || ''}
                        source={{uri: getItemImageUrl?.(item) || ''}}
                        type={type}
                        />

                    </Animated.View>
                );
            case 'list':
            default:
                return (
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
        }
    }, [view, item, colors]);
	const pressableContent = useCallback(() => (
        <Pressable
            onPress={() => {
                const url = getItemUrl?.(item);
                if (url) router.push(url as LinkProps['href']);
            }}
            onLongPress={() => onItemAction?.(item)}
			style={tw`flex-1`}
        >
            {itemContent()}
        </Pressable>
    ), [getItemUrl, item, onItemAction, router]);
	const itemWithContainer = useCallback(() => (
		<Animated.View style={tw`flex-row items-center justify-between gap-2`} entering={FadeInDown}>
			{pressableContent()}
			{view === 'list' && (
                <Button
                variant="ghost"
                size="icon"
                icon={Icons.EllipsisHorizontal}
                iconProps={{ color: colors.mutedForeground }}
                onPress={() => onItemAction?.(item)}
                />
            )}
		</Animated.View>
	), [pressableContent, colors, item, onItemAction, view]);

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
    return itemWithContainer();
});
CollectionItem.displayName = "CollectionItem";

export {
	CollectionItem
}