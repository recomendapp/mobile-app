import { ColumnDef } from '@tanstack/react-table';
import { UserActivity } from '@/types/type.db';
import { capitalize, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableItem } from './data-table-item';
import React from 'react';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserActivityUpdateMutation } from '@/features/user/userMutations';
import BottomSheetMedia from '@/components/bottom-sheets/sheets/BottomSheetMedia';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
import { Pressable } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';

export const Columns = () => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { openSheet, createConfirmSheet } = useBottomSheetStore();
	const updateActivity = useUserActivityUpdateMutation();

	const handleUnlike = React.useCallback(async (id: number) => {
		await updateActivity.mutateAsync({
			activityId: id,
			isLiked: false,
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
	const handleOpenSheet = React.useCallback(async (data: UserActivity) => {
		await openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.word.delete')),
					onPress: async () => await createConfirmSheet({
						title: capitalize(t('common.library.collection.likes.modal.delete_confirm.title')),
						onConfirm: () => handleUnlike(data.id),
					})
				}
			]
		});
	}, []);

	return React.useMemo<ColumnDef<UserActivity>[]>(() => [
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
				displayName: capitalize(t('common.messages.added_date')),
			},
		},
	], []);
};
