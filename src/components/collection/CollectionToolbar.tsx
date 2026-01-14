import { Icons } from "@/constants/Icons";
import { forwardRef, memo, useCallback, useMemo } from "react";
import { Button } from "../ui/Button";
import { FlashList } from "@shopify/flash-list";
import { LucideIcon } from "lucide-react-native";
import { FlatList, FlatListProps, useWindowDimensions } from "react-native";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";
import { ViewType } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

interface CollectionToolbarItem {
    label?: string;
    icon: LucideIcon;
    onPress: () => void;
}

interface CollectionToolbarProps extends Omit<FlatListProps<CollectionToolbarItem>, 'data' | 'renderItem'> {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    sortOrder: 'asc' | 'desc';
    sortByLabel: string;
    onSelectSort: () => void;
    additionalToolbarItems?: CollectionToolbarItem[];
}

const CollectionToolbar = forwardRef<
  React.ComponentRef<typeof FlashList>,
  CollectionToolbarProps
>(({
    view,
    onViewChange,
    sortOrder,
    sortByLabel,
    onSelectSort,
    additionalToolbarItems = [],
    contentContainerStyle,
    ...props
}, ref) => {
  const t = useTranslations();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const items = useMemo(() => [
    {
      icon: view === 'grid' ? Icons.Grid : Icons.List,
      label: view === 'grid' ? upperFirst(t('common.messages.grid', { count: 1 })) : upperFirst(t('common.messages.list', { count: 1 })),
      onPress: () => onViewChange(view === 'grid' ? 'list' : 'grid'),
    },
    {
      label: sortByLabel,
      icon: sortOrder === 'asc'
        ? Icons.ArrowUp
        : Icons.ArrowDown,
      onPress: onSelectSort,
    },
    ...additionalToolbarItems,
  ], [
    t,
    view,
    onViewChange,
    onSelectSort,
    sortByLabel,
    sortOrder,
    additionalToolbarItems,
  ]);

  const renderItem = useCallback(({ item } : { item: CollectionToolbarItem }) => (
    <Button variant="outline" icon={item.icon} onPress={item.onPress}>
      {item.label}
    </Button>
  ), []);

  return (
    <FlatList
    data={items}
    horizontal
    renderItem={renderItem}
    showsHorizontalScrollIndicator={false}
    style={{
      marginLeft: -PADDING_HORIZONTAL,
      width: SCREEN_WIDTH,
    }}
    contentContainerStyle={[
      {
        gap: GAP,
        paddingHorizontal: PADDING_HORIZONTAL,
      },
      contentContainerStyle
    ]}
    {...props}
    />
  );
});
CollectionToolbar.displayName = 'CollectionToolbar';

export default memo(CollectionToolbar);

export type {
  CollectionToolbarProps,
  CollectionToolbarItem
}