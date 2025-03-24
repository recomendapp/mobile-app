'use client';
import { ColumnDef } from '@tanstack/react-table';
import { UserActivity } from '@/types/type.db';
import { capitalize } from 'lodash';
import { ThemedText } from '@/components/ui/ThemedText';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableItem } from './data-table-item';
import React from 'react';

export const Columns = () => {
	const { t } = useTranslation();
	return React.useMemo<ColumnDef<UserActivity>[]>(() => [
		{
			id: 'item',
			accessorFn: (row) => row?.media?.title,
			meta: {
				displayName: capitalize(t('common.messages.item', { count: 1 })),
			},
			header: ({ column }) => (
			<DataTableColumnHeader column={column} title={capitalize(t('common.messages.item', { count: 1 }))} />
			),
			cell: ({ row }) => <DataTableItem key={row.index} item={row} />,
			enableHiding: false,
		},
		{
			id: 'actions',
			cell: ({ row, table, column }) => (
				<View>
					<ThemedText>actions</ThemedText>
				</View>
			// <DataTableRowActions
			//   data={row.original}
			//   table={table}
			//   row={row}
			//   column={column}
			// />
			),
		},
	], []);
};
