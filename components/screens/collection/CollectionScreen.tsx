import { upperFirst } from "lodash";
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useTheme } from "@/providers/ThemeProvider";
import React, { useCallback } from "react";
import Fuse, { FuseOptionKey } from "fuse.js";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import CollectionHeader from "@/components/screens/collection/CollectionHeader";
import { SearchBar } from "@/components/ui/searchbar";
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
import { Button, ButtonProps } from "@/components/ui/Button";
import * as Burnt from "burnt";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Media } from "@/types/type.db";
import { UseQueryResult } from "@tanstack/react-query";

const PADDING_BOTTOM = 8;

export interface SortByOption<T> {
    label: string;
    value: string;
    defaultOrder: 'asc' | 'desc';
    sortFn: (a: T, b: T, order: 'asc' | 'desc') => number;
}

export interface CollectionAction<T> {
    icon: any;
    label: string;
    variant?: ButtonProps['variant'];
    onPress: (item: T) => void;
    confirmationConfig?: {
        title: string;
        description: string;
        confirmText: string;
        successMessage: string;
        errorMessage: string;
    };
	position: 'top' | 'bottom' | 'left' | 'right';
}

interface CollectionScreenConfig<T> extends Omit<React.ComponentProps<typeof AnimatedLegendList<T>>, 'data'> {
	queryData: UseQueryResult<T[] | undefined>;
    screenTitle: string;
    searchPlaceholder: string;
    emptyStateMessage?: string;
    sortByOptions: SortByOption<T>[];
    swipeActions?: CollectionAction<T>[];
    bottomSheetActions?: CollectionAction<T>[];
    renderCustomItem?: (item: T) => React.ReactNode;
    customFilters?: React.ReactNode;
    getItemId: (item: T) => string | number;
	getItemMedia: (item: T) => Media;
    getItemTitle: (item: T) => string;
    getItemSubtitle?: (item: T) => string;
    getItemImageUrl?: (item: T) => string;
    getItemUrl?: (item: T) => string;
    getItemBackdropUrl?: (item: T) => string;
    getCreatedAt?: (item: T) => string;
	fuseKeys?: FuseOptionKey<T>[];
	fuseThreshold?: number;
}

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
        >
            {itemContent}
        </Pressable>
    );

    // If swipe actions are defined, we wrap the content in a Swipeable component
    if (swipeActions?.length) {
        return (
            <Swipeable
                friction={2}
                enableTrackpadTwoFingerGesture
                renderRightActions={(prog, drag, swipeable) => RightActions(prog, drag, item, swipeable)}
                containerStyle={tw`my-1 px-4`}
            >
                {pressableContent}
            </Swipeable>
        );
    }

    // If no swipe actions, we return the content directly
    return (
        <View style={tw`my-1 px-4`}>
            {pressableContent}
        </View>
    );
});
CollectionItem.displayName = "CollectionItem";

const CollectionScreen = <T extends {}>({
    queryData,
    screenTitle,
    searchPlaceholder,
    emptyStateMessage,
    sortByOptions,
    swipeActions,
    bottomSheetActions,
    renderCustomItem,
    customFilters,
    getItemId,
	getItemMedia,
    getItemTitle,
    getItemSubtitle,
    getItemImageUrl,
    getItemUrl,
    getItemBackdropUrl,
    getCreatedAt,
	fuseKeys,
	fuseThreshold = 0.5,
	// Props for the AnimatedLegendList
	...props
}: CollectionScreenConfig<T>) => {
    const { colors, bottomTabHeight } = useTheme();
    const t = useTranslations();
    const { showActionSheetWithOptions } = useActionSheet();

    const { data, isLoading, isRefetching, refetch } = queryData;
    const loading = data === undefined || isLoading;

    const [renderItems, setRenderItems] = React.useState<typeof data>([]);
    const [search, setSearch] = React.useState('');
    const [sortBy, setSortBy] = React.useState<SortByOption<T>>(sortByOptions[0]);
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>(sortByOptions[0].defaultOrder);

    const fuse = React.useMemo(() => {
        return new Fuse(data || [], {
			keys: fuseKeys || [{ name: 'title', getFn: (item) => getItemTitle(item) }],
            threshold: fuseThreshold,
        });
    }, [data, getItemTitle]);

    const backdrops = React.useMemo(() => {
        return data?.map((item) => getItemBackdropUrl?.(item)).filter(Boolean) || [];
    }, [data, getItemBackdropUrl]);

    const scrollY = useSharedValue(0);
    const headerHeight = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            'worklet';
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleSearch = useCallback((query: string) => {
        if (query.length > 0) {
            const results = fuse.search(query).map(({ item }) => item);
            setRenderItems(results);
        } else {
            setRenderItems(data || []);
        }
    }, [fuse, data]);

    const handleSortBy = useCallback(() => {
        const sortByOptionsWithCancel = [
            ...sortByOptions,
            { label: upperFirst(t('common.messages.cancel')), value: 'cancel', defaultOrder: 'asc' as const },
        ];
        const cancelIndex = sortByOptionsWithCancel.length - 1;
        
        showActionSheetWithOptions({
            options: sortByOptionsWithCancel.map((option) => option.label),
            disabledButtonIndices: [sortByOptionsWithCancel.findIndex(option => option.value === sortBy.value)],
            cancelButtonIndex: cancelIndex,
        }, (selectedIndex) => {
            if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
            const selected = sortByOptionsWithCancel[selectedIndex] as SortByOption<T>;
            setSortBy(selected);
            setSortOrder(selected.defaultOrder);
        });
    }, [sortByOptions, showActionSheetWithOptions, sortBy.value, t]);

    React.useEffect(() => {
        if (data) {
            handleSearch(search);
        }
    }, [data, search]);

    React.useEffect(() => {
        if (sortBy && sortBy.sortFn) {
            setRenderItems((prev) =>
                [...(prev ?? [])].sort((a, b) => sortBy.sortFn(a, b, sortOrder))
            );
        }
    }, [sortBy, sortOrder, data, getItemTitle, getCreatedAt]);

    return (
        <>
            <AnimatedStackScreen
                options={{
                    headerTitle: screenTitle,
                    headerTransparent: true,
                }}
                scrollY={scrollY}
                triggerHeight={headerHeight}
            />
            <AnimatedLegendList
			onScroll={scrollHandler}
			ListHeaderComponent={
				<>
					<CollectionHeader
						title={screenTitle}
						numberOfItems={data?.length || 0}
						scrollY={scrollY}
						headerHeight={headerHeight}
						loading={loading}
						backdrops={backdrops}
					/>
					{!loading && (
						<View style={tw`gap-2 mx-4`}>
							<SearchBar
								value={search}
								onChangeText={setSearch}
								onSearch={handleSearch}
								debounceMs={200}
								placeholder={searchPlaceholder}
							/>
							<View style={tw`flex-row justify-end items-center gap-2`}>
								<Button
									icon={sortOrder === 'desc' ? Icons.ArrowDownNarrowWide : Icons.ArrowUpNarrowWide}
									variant="muted"
									size='icon'
									onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
								/>
								<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>
									{sortBy.label}
								</Button>
							</View>
							{customFilters}
						</View>
					)}
				</>
			}
			ListHeaderComponentStyle={tw`mb-2`}
			data={renderItems || []}
			renderItem={({ item }) => (
				<CollectionItem
				key={getItemId(item)}
				item={item}
				swipeActions={swipeActions}
				bottomSheetActions={bottomSheetActions}
				renderCustom={renderCustomItem}
				getItemId={getItemId}
				getItemMedia={getItemMedia}
				getItemTitle={getItemTitle}
				getItemSubtitle={getItemSubtitle}
				getItemImageUrl={getItemImageUrl}
				getItemUrl={getItemUrl}
				/>
			)}
			keyExtractor={(item) => getItemId(item).toString()}
			ListEmptyComponent={
				loading ? <Icons.Loader /> : (
					<View style={tw`flex-1 items-center justify-center`}>
						<Text style={{ color: colors.mutedForeground }}>
							{emptyStateMessage || upperFirst(t('common.messages.no_results'))}
						</Text>
					</View>
				)
			}
			showsVerticalScrollIndicator={false}
			refreshing={isRefetching}
			onRefresh={refetch}
			contentContainerStyle={{
				paddingBottom: bottomTabHeight + PADDING_BOTTOM,
			}}
			{...props}
            />
        </>
    );
};

export default CollectionScreen;