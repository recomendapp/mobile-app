import { RowData, Table } from '@tanstack/react-table';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import BottomSheetDefaultView from '@/components/bottom-sheets/templates/BottomSheetDefaultView';
import { Pressable } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ui/ThemedText';
import { ChevronsUpDownIcon } from 'lucide-react-native';
import { useTranslations } from 'use-intl';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    displayName: string;
  }
}

interface DataTableSortOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableSortOptions<TData>({
  table,
}: DataTableSortOptionsProps<TData>) {
  const { colors } = useTheme();
  const t = useTranslations();
  const { openSheet, closeSheet } = useBottomSheetStore();
  const handleOnPress = async () => {
    const sheetId = await openSheet(BottomSheetDefaultView, {
      content: (
        <>
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanSort()
            )
            .map((column) => (
                <Pressable
                key={column.id}
                onPress={() => {
                  column.toggleSorting();
                  closeSheet(sheetId);
                }}
                style={tw`flex-row items-center gap-2 p-4`}
                >
                  {{
                  asc: <Icons.ChevronUp color={colors.accentYellow} size={16} style={tw`ml-2`} />,
                  desc: <Icons.ChevronDown color={colors.accentYellow} size={16} style={tw`ml-2`} />,
                  }[column.getIsSorted() as string] ?? (
                  <ChevronsUpDownIcon color={colors.mutedForeground} size={16} style={tw`ml-2`} />
                  )}
                  <ThemedText>
                    {column.columnDef.meta?.displayName}
                  </ThemedText>
                </Pressable>
            ))
          }
        </>
      ),
    });
  };
  return (
    <Button
    icon={Icons.Filter}
    variant="outline"
    className="ml-auto flex h-8"
    onPress={handleOnPress}
    >
      {upperFirst(t('common.messages.sort'))}
    </Button>
  );
}
