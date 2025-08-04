import { ColumnDef } from '@tanstack/react-table';
import { UserRecosAggregated } from '@/types/type.db';
import { upperFirst } from 'lodash';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableItem } from './data-table-item';
import React from 'react';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserRecosCompleteMutation, useUserRecosDeleteMutation } from '@/features/user/userMutations';
import BottomSheetMedia from '@/components/bottom-sheets/sheets/BottomSheetMedia';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
import { useTheme } from '@/providers/ThemeProvider';
import BottomSheetMyRecosSenders from '@/components/bottom-sheets/sheets/BottomSheetMyRecosSenders';
import { Alert } from 'react-native';
import { useTranslations } from 'use-intl';
import { Pressable } from 'react-native-gesture-handler';

export const Columns = () => {
	const { colors } = useTheme();
	const t = useTranslations();
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
					title: upperFirst(t('common.messages.deleted', { count: 1, gender: 'male' })),
					preset: 'done',
				});
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
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
					title: upperFirst(t('common.messages.completed', { count: 1, gender: 'male' })),
					preset: 'done',
				});
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
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
					onPress: () => Alert.alert(
						upperFirst(t('pages.collection.my_recos.modal.complete_confirm.title')),
						upperFirst(t('pages.collection.my_recos.modal.complete_confirm.description', { title: data.media!.title! })),
						[
							{
								text: upperFirst(t('common.messages.cancel')),
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
					onPress: () => openSheet(BottomSheetMyRecosSenders, {
						comments: data.senders,
					}),
				}
			],
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.messages.delete')),
					onPress: () => Alert.alert(
						upperFirst(t('common.library.collection.my_recos.modal.delete_confirm.title')),
						upperFirst(t('common.library.collection.my_recos.modal.delete_confirm.description', { title: data.media!.title! })),
						[
							{
								text: upperFirst(t('common.messages.cancel')),
								style: 'cancel',
							},
							{
								text: upperFirst(t('common.messages.delete')),
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
				<Pressable
				onPress={() => handleOpenSheet(row.original)}
				>
					<Icons.EllipsisHorizontal color={colors.foreground}/>
				</Pressable>
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
		{
			id: 'by',
      		accessorFn: (row) => row?.senders.length,
			meta: {
				displayName: upperFirst(t('common.messages.added_by')),
			},
		}
	], []);
};
