'use client';
import { Table } from '@tanstack/react-table';

import { capitalize } from 'lodash';
import { View } from 'react-native';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { DataTableSortOptions } from './data-table-sort-options';
import { Input } from '@/components/ui/Input';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <View style={tw`flex-row items-center justify-between gap-4 px-2`}>
		<View style={tw`flex-row flex-1 items-center gap-2`}>
			<Input
			placeholder={capitalize(t('common.library.collection.likes.search.placeholder'))}
			value={
				(table.getColumn('item')?.getFilterValue() as string) ??
				''
			}
			onChangeText={(text) =>
				table
				.getColumn('item')
				?.setFilterValue(text)
			}
			style={tw`w-full`}
			/>
		</View>
      {/* <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={capitalize(common('library.collection.likes.search.placeholder'))}
          value={
            (table.getColumn('item')?.getFilterValue() as string) ??
            ''
          }
          onChange={(event) =>
            table
              .getColumn('item')
              ?.setFilterValue(event.target.value)
          }
          className="h-8 w-full lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {capitalize(common('word.cancel'))}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div> */}
      <DataTableSortOptions table={table} />
      {/* <DataTableViewOptions table={table} /> */}
    </View>
  );
}
