import { ColumnDef } from '@tanstack/react-table';
import { UserWatchlist } from '@/types/type.db';
import { capitalize, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableItem } from './data-table-item';
import React from 'react';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserWatchlistDeleteMutation } from '@/features/user/userMutations';
import BottomSheetMedia from '@/components/bottom-sheets/sheets/BottomSheetMedia';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';
import BottomSheetWatchlistComment from '@/components/bottom-sheets/sheets/BottomSheetWatchlistComment';

export const Columns = () => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { openSheet, createConfirmSheet } = useBottomSheetStore();
	const deleteWatchlist = useUserWatchlistDeleteMutation();

	const handleDeleteWatchlist = React.useCallback(async (id: number) => {
		await deleteWatchlist.mutateAsync({
			watchlistId: id,
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: capitalize(t('common.word.deleted')),
					preset: 'done',
				});
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.errors.an_error_occurred')),
					preset: 'error',
				});
			}
		});
	}, []);

	const handleOpenSheet = React.useCallback(async (data: UserWatchlist) => {
		await openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsTop: [
				{
					icon: Icons.Comment,
					label: data?.comment ? capitalize(t('common.messages.view_comment', { count: 1 })) : capitalize(t('common.messages.add_comment')),
					onPress: async () => await openSheet(BottomSheetWatchlistComment, {
						watchlistItem: data,
					}),
				},
			],
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.word.delete')),
					onPress: async () => await createConfirmSheet({
						title: capitalize(t('common.library.collection.watchlist.modal.delete_confirm.title')),
						onConfirm: () => handleDeleteWatchlist(data.id),
					})
				}
			]
		});
	}, []);

	return React.useMemo<ColumnDef<UserWatchlist>[]>(() => [
		{
			id: 'item',
			accessorFn: (row) => row?.media?.title,
			meta: {
				displayName: capitalize(t('common.messages.title')),
			},
			header: ({ column }) => (
			<DataTableColumnHeader column={column} title={capitalize(t('common.messages.item', { count: 1 }))} />
			),
			cell: ({ row }) => <DataTableItem key={row.index} item={row} openSheet={handleOpenSheet} />,
			enableHiding: false,
		},
		{
			id: 'actions',
			cell: ({ row }) => (
				<TouchableOpacity
				onPress={() => handleOpenSheet(row.original)}
				>
					<Icons.EllipsisHorizontal color={colors.foreground}/>
				</TouchableOpacity>
			),
		},
		// Sorting columns
		{
			id: 'created_at',
			accessorFn: (row) => row.created_at,
			meta: {
				displayName: capitalize(t('common.messages.added_date')),
			},
		},
	], []);
};
