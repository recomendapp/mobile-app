import { ColumnDef } from '@tanstack/react-table';
import { UserRecosAggregated } from '@/types/type.db';
import { capitalize, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableItem } from './data-table-item';
import React from 'react';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserRecosCompleteMutation, useUserRecosDeleteMutation } from '@/features/user/userMutations';
import BottomSheetMedia from '@/components/bottom-sheets/sheets/BottomSheetMedia';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@/context/ThemeProvider';
import BottomSheetMyRecosSenders from '@/components/bottom-sheets/sheets/BottomSheetMyRecosSenders';

export const Columns = () => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { openSheet, createConfirmSheet } = useBottomSheetStore();
	const deleteReco = useUserRecosDeleteMutation();
	const completeReco = useUserRecosCompleteMutation();

	const handleDeleteReco = React.useCallback(async (userId: string, id: number) => {
		await deleteReco.mutateAsync({
			userId: userId,
			mediaId: id,
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

	const handleCompleteReco = React.useCallback(async (userId: string, id: number) => {
		await completeReco.mutateAsync({
			userId: userId,
			mediaId: id,
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: capitalize(t('common.messages.completed')),
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

	const handleOpenSheet = React.useCallback((data: UserRecosAggregated) => {
		openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsTop: [
				{
					icon: Icons.Check,
					label: upperFirst(t('common.messages.complete')),
					onPress: () => createConfirmSheet({
						title: capitalize(t('common.library.collection.my_recos.modal.complete_confirm.title')),
						onConfirm: () => handleCompleteReco(data.user_id!, data.media_id!),
					})
				},
				{
					icon: Icons.Comment,
					label: upperFirst(t('common.messages.view_recommendation', { count: 1})),
					onPress: () => openSheet(BottomSheetMyRecosSenders, {
						comments: data.senders,
					}),
				}
			],
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.word.delete')),
					onPress: () => createConfirmSheet({
						title: capitalize(t('common.library.collection.my_recos.modal.delete_confirm.title')),
						onConfirm: () => handleDeleteReco(data.user_id!, data.media_id!),
					})
				}
			]
		});
	}, []);

	return React.useMemo<ColumnDef<UserRecosAggregated>[]>(() => [
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
		{
			id: 'by',
      		accessorFn: (row) => row?.senders.length,
			meta: {
				displayName: capitalize(t('common.messages.added_by')),
			},
		}
	], []);
};
