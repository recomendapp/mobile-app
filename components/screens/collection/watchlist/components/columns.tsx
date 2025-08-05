import { ColumnDef } from '@tanstack/react-table';
import { UserWatchlist } from '@/types/type.db';
import { upperFirst } from 'lodash';
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
import { Alert } from 'react-native';
import { useTranslations } from 'use-intl';

export const Columns = () => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { openSheet } = useBottomSheetStore();
	const deleteWatchlist = useUserWatchlistDeleteMutation();

	const handleDeleteWatchlist = React.useCallback(async (id: number) => {
		await deleteWatchlist.mutateAsync({
			watchlistId: id,
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.deleted', { count: 1, gender: 'male' })),
					preset: 'done',
				});
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		});
	}, []);

	const handleOpenSheet = React.useCallback((data: UserWatchlist) => {
		openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsTop: [
				{
					icon: Icons.Comment,
					label: data?.comment ? upperFirst(t('common.messages.view_comment', { count: 1 })) : upperFirst(t('common.messages.add_comment', { count: 1 })),
					onPress: async () => openSheet(BottomSheetWatchlistComment, {
						watchlistItem: data,
					}),
				},
			],
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.messages.delete')),
					onPress: () => Alert.alert(
						upperFirst(t('pages.collection.watchlist.modal.delete_confirm.title')),
						upperFirst(t('pages.collection.watchlist.modal.delete_confirm.description', { title: data.media!.title! })),
						[
							{
								text: upperFirst(t('common.messages.cancel')),
								style: 'cancel',
							},
							{
								text: upperFirst(t('common.messages.delete')),
								onPress: () => handleDeleteWatchlist(data.id),
								style: 'destructive',
							}
						]
					)
				}
			]
		});
	}, []);

	return React.useMemo<ColumnDef<UserWatchlist>[]>(() => [
		{
			id: 'item',
			accessorFn: (row) => row?.media?.title,
			meta: {
				displayName: upperFirst(t('common.messages.title')),
			},
			header: ({ column }) => (
			<DataTableColumnHeader column={column} title={upperFirst(t('common.messages.item', { count: 1 }))} />
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
				displayName: upperFirst(t('common.messages.date_added')),
			},
		},
	], []);
};
