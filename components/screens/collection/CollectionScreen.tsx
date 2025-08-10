import { upperFirst } from "lodash";
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import AnimatedStackScreen, { AnimatedStackScreenProps } from "@/components/ui/AnimatedStackScreen";
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
import { FlatList, Pressable } from "react-native-gesture-handler";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Alert } from "react-native";
import { Button, ButtonProps } from "@/components/ui/Button";
import * as Burnt from "burnt";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Media } from "@/types/type.db";
import { UseQueryResult } from "@tanstack/react-query";
import { LucideIcon } from "lucide-react-native";
import { CollectionItem } from "./CollectionItem";

const PADDING_BOTTOM = 8;

interface ToolbarItem {
    label?: string;
    icon: LucideIcon;
    onPress: () => void;
}

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
    screenSubtitle?: string | React.ReactNode | (() => React.ReactNode);
    searchPlaceholder: string;
    emptyStateMessage?: string;
    sortByOptions: SortByOption<T>[];
    swipeActions?: CollectionAction<T>[];
    bottomSheetActions?: CollectionAction<T>[];
    renderCustomItem?: (item: T) => React.ReactNode;
    customFilters?: React.ReactNode;
    additionalToolbarItems?: ToolbarItem[];
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

    stackScreenProps?: Omit<AnimatedStackScreenProps, 'scrollY' | 'triggerHeight' | 'options'>;
}

const CollectionScreen = <T extends {}>({
    queryData,
    screenTitle,
    screenSubtitle,
    searchPlaceholder,
    emptyStateMessage,
    sortByOptions,
    swipeActions,
    bottomSheetActions,
    renderCustomItem,
    customFilters,
    additionalToolbarItems,
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
    stackScreenProps,
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

    const renderToolbar = () => {
        const toolbarItems: ToolbarItem[] = [
            ...(additionalToolbarItems || []),
            {
                // label: upperFirst(t('common.messages.order')),
                icon: sortOrder === 'asc' ? Icons.ArrowUpNarrowWide : Icons.ArrowDownNarrowWide,
                onPress: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
            },
            {
                label: sortBy.label,
                icon: Icons.Filter,
                onPress: handleSortBy,
            },
        ];

        return (
            <FlatList
            data={toolbarItems}
            horizontal
            renderItem={({ item }) => (
                <Button
                variant="muted"
                icon={item.icon}
                onPress={item.onPress}
                >
                    {item.label}
                </Button>
            )}
            contentContainerStyle={tw`px-4`}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={tw`w-2`} />}
            />
        );
    };

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
                {...stackScreenProps}
            />
            <AnimatedLegendList
			onScroll={scrollHandler}
			ListHeaderComponent={
				<>
					<CollectionHeader
						title={screenTitle}
                        bottomText={screenSubtitle}
						numberOfItems={data?.length || 0}
						scrollY={scrollY}
						headerHeight={headerHeight}
						loading={loading}
						backdrops={backdrops}
					/>
					{!loading && (
						<View style={tw`gap-2`}>
							<SearchBar
                            value={search}
                            onChangeText={setSearch}
                            onSearch={handleSearch}
                            debounceMs={200}
                            placeholder={searchPlaceholder}
                            containerStyle={tw`mx-4`}
							/>
                            {renderToolbar()}
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