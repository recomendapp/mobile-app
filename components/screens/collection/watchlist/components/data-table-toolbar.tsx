import { Table } from '@tanstack/react-table';
import { capitalize } from 'lodash';
import { View } from 'react-native';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { DataTableSortOptions } from './data-table-sort-options';
import { Input } from '@/components/ui/InputOld';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/Icons';
import { useTheme } from '@/providers/ThemeProvider';
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <View style={tw`gap-2 px-2`}>
      <View style={tw`flex-row flex-1 items-center gap-2`}>
        <Input
        placeholder={capitalize(t('common.library.collection.watchlist.search.placeholder'))}
        value={
          (table.getColumn('item')?.getFilterValue() as string) ??
          ''
        }
        onChangeText={(text) =>
          table
          .getColumn('item')
          ?.setFilterValue(text)
        }
        style={tw`flex-1`}
        />
        {isFiltered && (
          <Button
            icon={Icons.Cancel}
            variant="outline"
            size='icon'
            onPress={() => table.resetColumnFilters()}
            style={tw`px-2`}
          />
        )}
      </View>
      <View style={tw`flex-row items-center justify-end gap-2`}>
        {/* <DataTableFilterOptions table={table} /> */}
        <DataTableSortOptions table={table} />
      </View>
    </View>
  );
}
