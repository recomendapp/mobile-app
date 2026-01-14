import { upperFirst } from "lodash";
import { SharedValue, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import React, { useCallback } from "react";
import Fuse, { FuseOptionKey } from "fuse.js";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import CollectionHeader from "@/components/collection/CollectionHeader";
import { SearchBar } from "@/components/ui/searchbar";
import tw from "@/lib/tw";
import { Icons } from "@/constants/Icons";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { ButtonProps } from "@/components/ui/Button";
import { UseQueryResult } from "@tanstack/react-query";
import { CollectionItem } from "./CollectionItem";
import { ImageType } from "@/components/utils/ImageWithFallback";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { MediaType, ViewType } from "@recomendapp/types";
import { LegendListRenderItemProps } from "@legendapp/list";
import { useWindowDimensions } from "react-native";
import CollectionToolbar, { CollectionToolbarItem } from "./CollectionToolbar";
import BottomSheetSort from "../bottom-sheets/sheets/BottomSheetSort";
import useBottomSheetStore from "@/stores/useBottomSheetStore";

const MemoizedSearchBar = React.memo(SearchBar);

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
	position: 'top' | 'bottom' | 'left' | 'right';
}

interface CollectionScreenConfig<T> extends Omit<React.ComponentProps<typeof AnimatedLegendList<T>>, 'data'> {
	queryData: UseQueryResult<T[] | undefined>;
    scrollY?: SharedValue<number>;
    headerHeight?: SharedValue<number>;
    screenTitle: string;
    hideHeader?: boolean;
    hideTitle?: boolean;
    hideNumberOfItems?: boolean;
    screenSubtitle?: string | React.ReactNode | (() => React.ReactNode);
    poster?: string;
    posterType?: ImageType;
    searchPlaceholder: string;
    emptyStateMessage?: string;
    sortByOptions: SortByOption<T>[];
    swipeActions?: CollectionAction<T>[];
    bottomSheetActions?: CollectionAction<T>[];
    customFilters?: React.ReactNode;
    additionalToolbarItems?: CollectionToolbarItem[];
    getItemId: (item: T) => string | number;
    getItemTitle: (item: T) => string;
    getItemSubtitle?: (item: T) => string;
    getItemImageUrl?: (item: T) => string;
    getItemUrl?: (item: T) => string;
    getItemBackdropUrl?: (item: T) => string;
    getCreatedAt?: (item: T) => string;
    onItemAction?: (item: T) => void;
    defaultView?: ViewType;
    onViewChange?: (view: ViewType) => void;
    type?: MediaType;
	fuseKeys?: FuseOptionKey<T>[];
	fuseThreshold?: number;
}

const CollectionScreen = <T extends {}>({
    queryData,
    scrollY: scrollYProp,
    headerHeight: headerHeightProp,
    renderItem: renderItemProp,
    screenTitle,
    hideHeader,
    hideTitle,
    hideNumberOfItems,
    screenSubtitle,
    poster,
    posterType,
    searchPlaceholder,
    emptyStateMessage,
    sortByOptions,
    swipeActions,
    bottomSheetActions,
    customFilters,
    additionalToolbarItems,
    getItemId,
    getItemTitle,
    getItemSubtitle,
    getItemImageUrl,
    getItemUrl,
    getItemBackdropUrl,
    getCreatedAt,
    onItemAction,
    defaultView = 'list',
    onViewChange,
    maintainVisibleContentPosition = false,
    numColumns = 4,
    type,
	fuseKeys,
	fuseThreshold = 0.5,
	...props
}: CollectionScreenConfig<T>) => {
    const { colors, bottomOffset, tabBarHeight} = useTheme();
    const t = useTranslations();
    const openSheet = useBottomSheetStore((state) => state.openSheet);
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const { data, isLoading, isRefetching, refetch } = queryData;
    const loading = data === undefined || isLoading;

    // Shared Values
    const scrollYInternal = useSharedValue(0);
    const headerHeightInternal = useSharedValue(0);
    const scrollY = scrollYProp || scrollYInternal;
    const headerHeight = headerHeightProp || headerHeightInternal;

    const [view, setView] = React.useState<ViewType>(defaultView);

    const [renderItems, setRenderItems] = React.useState<typeof data>([]);
    const [search, setSearch] = React.useState('');
    const [sortBy, setSortBy] = React.useState<SortByOption<T>>(sortByOptions[0]);
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>(sortByOptions[0].defaultOrder);

    const fuse = React.useMemo(() => {
        return new Fuse(data || [], {
			keys: fuseKeys || [{ name: 'title', getFn: (item) => getItemTitle(item) }],
            threshold: fuseThreshold,
        });
    }, [fuseKeys, fuseThreshold, data, getItemTitle]);

    const backdrops = React.useMemo(() => {
        return data?.map((item) => getItemBackdropUrl?.(item)).filter(Boolean) || [];
    }, [data, getItemBackdropUrl]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            'worklet';
            scrollY.value = event.contentOffset.y;
        },
    });

    // Handlers
    const handleSearch = useCallback((query: string) => {
        if (query.length > 0) {
            const results = fuse.search(query).map(({ item }) => item);
            setRenderItems(results);
        } else {
            setRenderItems(data || []);
        }
    }, [fuse, data]);
    const handleViewChange = useCallback((newView: ViewType) => {
        setView(newView);
        onViewChange?.(newView);
    }, [onViewChange]);
    const handleSortBy = useCallback(() => {
        openSheet(BottomSheetSort, {
            options: sortByOptions,
            selectedValue: sortBy.value,
            order: sortOrder,
            onChange: (value, order) => {
                setSortBy(value);
                setSortOrder(order);
            },
        });
    }, [openSheet, sortByOptions, sortBy, sortOrder]);
    
    // Render
    const renderItem = useCallback(({ item, index } : LegendListRenderItemProps<T>) => {
        return (
            <CollectionItem
            key={getItemId(item)}
            item={item}
            swipeActions={swipeActions}
            bottomSheetActions={bottomSheetActions}
            getItemId={getItemId}
            getItemTitle={getItemTitle}
            getItemSubtitle={getItemSubtitle}
            getItemImageUrl={getItemImageUrl}
            getItemUrl={getItemUrl}
            onItemAction={onItemAction}
            view={view}
            type={type}
            index={index}
            />
        )
    }, [
        swipeActions,
        bottomSheetActions,
        getItemId,
        getItemTitle,
        getItemSubtitle,
        getItemImageUrl,
        getItemUrl,
        onItemAction,
        view,
        type,
    ]);

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
        <AnimatedLegendList
        onScroll={scrollHandler}
        ListHeaderComponent={
            <View>
                {!hideHeader && <CollectionHeader
                    title={screenTitle}
                    hideTitle={hideTitle}
                    poster={poster}
                    posterType={posterType}
                    bottomText={screenSubtitle}
                    numberOfItems={data?.length || 0}
                    hideNumberOfItems={hideNumberOfItems}
                    scrollY={scrollY}
                    headerHeight={headerHeight}
                    backdrops={backdrops}
                    type={type}
                />}
                {!loading && (
                    <View style={tw`gap-2`}>
                        <MemoizedSearchBar
                        value={search}
                        onChangeText={setSearch}
                        onSearch={handleSearch}
                        debounceMs={200}
                        placeholder={searchPlaceholder}
                        />
                        <CollectionToolbar
                        view={view}
                        onViewChange={handleViewChange}
                        sortOrder={sortOrder}
                        sortByLabel={sortBy.label}
                        onSelectSort={handleSortBy}
                        additionalToolbarItems={additionalToolbarItems}
                        />
                        {customFilters}
                    </View>
                )}
            </View>
        }
        ListHeaderComponentStyle={tw`mb-2`}
        data={renderItems || []}
        extraData={view}
        renderItem={renderItemProp || renderItem}
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
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={{
            paddingHorizontal: PADDING_HORIZONTAL,
            paddingBottom: bottomOffset + PADDING_VERTICAL,
            gap: GAP,
        }}
        scrollIndicatorInsets={{
            bottom: tabBarHeight
        }}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        numColumns={
            view === 'grid' ? (
                SCREEN_WIDTH < 360 ? numColumns - 1 :
                SCREEN_WIDTH < 414 ? numColumns :
                SCREEN_WIDTH < 600 ? numColumns + 1 :
                SCREEN_WIDTH < 768 ? numColumns + 2 : numColumns + 3
            ) : 1}
        {...props}
        />
    </>
    );
};

export default CollectionScreen;