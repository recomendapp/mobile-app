'use client';
import { Table } from '@tanstack/react-table';
import { capitalize } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Button, ButtonText } from '@/components/ui/Button';

interface DataTableSortOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableSortOptions<TData>({
  table,
}: DataTableSortOptionsProps<TData>) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const handleOnPress = () => {
    console.log('handleOnPress');
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
