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
import { useTheme } from '@/providers/ThemeProvider';
import BottomSheetMyRecosSenders from '@/components/bottom-sheets/sheets/BottomSheetMyRecosSenders';
import { Alert } from 'react-native';

export const Columns = () => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { openSheet } = useBottomSheetStore();
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

	const handleOpenSheet = React.useCallback(async (data: UserRecosAggregated) => {
		await openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsTop: [
				{
					icon: Icons.Check,
					label: upperFirst(t('common.messages.complete')),
					onPress: () => Alert.alert(
						capitalize(t('common.library.collection.my_recos.modal.complete_confirm.title')),
						upperFirst(t('common.library.collection.my_recos.modal.complete_confirm.description', { title: data.media!.title })),
						[
							{
								text: upperFirst(t('common.word.cancel')),
								style: 'cancel',
							},
							{
								text: upperFirst(t('common.messages.complete')),
								onPress: () => handleCompleteReco(data.user_id!, data.media_id!),
								style: 'default',
							}
						]
					)
				},
				{
					icon: Icons.Comment,
					label: upperFirst(t('common.messages.view_recommendation', { count: 1})),
					onPress: async () => await openSheet(BottomSheetMyRecosSenders, {
						comments: data.senders,
					}),
				}
			],
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.word.delete')),
					onPress: () => Alert.alert(
						capitalize(t('common.library.collection.my_recos.modal.delete_confirm.title')),
						upperFirst(t('common.library.collection.my_recos.modal.delete_confirm.description', { title: data.media!.title })),
						[
							{
								text: upperFirst(t('common.word.cancel')),
								style: 'cancel',
							},
							{
								text: upperFirst(t('common.word.delete')),
								onPress: () => handleDeleteReco(data.user_id!, data.media_id!),
								style: 'destructive',
							}
						]
					)
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
