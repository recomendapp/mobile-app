import { RowData, Table } from '@tanstack/react-table';
import { capitalize } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Button, ButtonText } from '@/components/ui/Button';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import BottomSheetDefaultView from '@/components/bottom-sheets/templates/BottomSheetDefaultView';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ui/ThemedText';
import { ChevronsUpDownIcon } from 'lucide-react-native';

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
  const { t } = useTranslation();
  const { openSheet, closeSheet } = useBottomSheetStore();
  const handleOnPress = () => {
    const sheetId = openSheet(BottomSheetDefaultView, {
      content: (
        <>
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanSort()
            )
            .map((column) => (
                <TouchableOpacity
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
                </TouchableOpacity>
            ))
          }
        </>
      ),
    },
    null)
  };
  return (
    <Button
    variant="outline"
    className="ml-auto flex h-8"
    onPress={handleOnPress}
    >
      <Icons.Filter color={colors.foreground} size={16} style={tw`mr-2`} />
      <ButtonText variant="outline">{capitalize(t('common.word.sort'))}</ButtonText>
    </Button>
        // {table
        //   .getAllColumns()
        //   .filter(
        //     (column) =>
        //       typeof column.accessorFn !== 'undefined' && column.getCanSort()
        //   )
        //   .map((column) => {
        //     return (
        //       <DropdownMenuItem
        //         key={column.id}
        //         onClick={() => column.toggleSorting()}
        //       >
        //         {column.columnDef.meta?.displayName}
        //         {{
        //           asc: <ChevronUp className=" ml-2 h-4 w-4 text-accent-yellow" />,
        //           desc: <ChevronDown className=" ml-2 h-4 w-4 text-accent-yellow" />,
        //         }[column.getIsSorted() as string] ?? null}
        //       </DropdownMenuItem>
        //     );
        //   })}
  );
}
