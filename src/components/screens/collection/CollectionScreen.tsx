import { upperFirst } from "lodash";
import { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import { useTranslations } from "use-intl";
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
import { Button, ButtonProps } from "@/components/ui/Button";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { UseQueryResult } from "@tanstack/react-query";
import { LucideIcon } from "lucide-react-native";
import { CollectionItem } from "./CollectionItem";
import { ImageType } from "@/components/utils/ImageWithFallback";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { MediaType, ViewType } from "@recomendapp/types";
import { LegendListRenderItemProps } from "@legendapp/list";
import { FlatList, useWindowDimensions } from "react-native";

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
	position: 'top' | 'bottom' | 'left' | 'right';
}

interface CollectionScreenConfig<T> extends Omit<React.ComponentProps<typeof AnimatedLegendList<T>>, 'data'> {
	queryData: UseQueryResult<T[] | undefined>;
    scrollY: SharedValue<number>;
    headerHeight: SharedValue<number>;
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
    renderCustomItem?: (item: T) => React.ReactNode;
    customFilters?: React.ReactNode;
    additionalToolbarItems?: ToolbarItem[];
    getItemId: (item: T) => string | number;
    getItemTitle: (item: T) => string;
    getItemSubtitle?: (item: T) => string;
    getItemImageUrl?: (item: T) => string;
    getItemUrl?: (item: T) => string;
    getItemBackdropUrl?: (item: T) => string;
    getCreatedAt?: (item: T) => string;
    onItemAction?: (item: T) => void;
    view?: ViewType;
    type?: MediaType;
	fuseKeys?: FuseOptionKey<T>[];
	fuseThreshold?: number;
}

const CollectionScreen = <T extends {}>({
    queryData,
    scrollY,
    headerHeight,
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
    renderCustomItem,
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
    view = 'list',
    numColumns = 4,
    type,
	fuseKeys,
	fuseThreshold = 0.5,
	...props
}: CollectionScreenConfig<T>) => {
    const { colors, bottomOffset } = useTheme();
    const t = useTranslations();
    const { showActionSheetWithOptions } = useActionSheet();
    const { width: SCREEN_WIDTH } = useWindowDimensions();
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
    
    // Render
    const renderToolbar = () => {
        const toolbarItems: ToolbarItem[] = [
            ...(additionalToolbarItems || []),
            {
                icon: sortOrder === 'asc' ? Icons.ArrowUpNarrowWide : Icons.ArrowDownNarrowWide,
                onPress: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
            },
            {
                label: sortBy.label,
                icon: Icons.Filters,
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
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={tw`w-2`} />}
            />
        );
    };
    const renderItem = ({ item, index } : LegendListRenderItemProps<T>) => {
        return (
            <CollectionItem
            key={getItemId(item)}
            item={item}
            swipeActions={swipeActions}
            bottomSheetActions={bottomSheetActions}
            renderCustom={renderCustomItem}
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
    }

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
				<>
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
							<SearchBar
                            value={search}
                            onChangeText={setSearch}
                            onSearch={handleSearch}
                            debounceMs={200}
                            placeholder={searchPlaceholder}
                            // containerStyle={{ marginHorizontal: PADDING_HORIZONTAL }}
							/>
                            {renderToolbar()}
							{customFilters}
						</View>
					)}
				</>
			}
			ListHeaderComponentStyle={tw`mb-2`}
			data={renderItems || []}
            extraData={view}
			renderItem={renderItem}
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
                paddingHorizontal: PADDING_HORIZONTAL,
                paddingBottom: bottomOffset + PADDING_VERTICAL,
                gap: GAP,
			}}
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