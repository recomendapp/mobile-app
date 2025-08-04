import { ColumnDef } from '@tanstack/react-table';
import { UserActivity } from '@/types/type.db';
import { upperFirst } from 'lodash';
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
import { Alert } from 'react-native';
import { useTranslations } from 'use-intl';

export const Columns = () => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { openSheet } = useBottomSheetStore();
	const updateActivity = useUserActivityUpdateMutation();

	const handleUnlike = React.useCallback(async (id: number) => {
		await updateActivity.mutateAsync({
			activityId: id,
			isLiked: false,
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
	const handleOpenSheet = React.useCallback((data: UserActivity) => {
		openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.messages.delete')),
					onPress: () => Alert.alert(
						upperFirst(t('pages.collection.heart_picks.modal.delete_confirm.label')),
						upperFirst(t('pages.collection.heart_picks.modal.delete_confirm.description', { title: data.media!.title })),
						[
							{
								text: upperFirst(t('common.messages.cancel')),
								style: 'cancel',
							},
							{
								text: upperFirst(t('common.messages.delete')),
								onPress: () => handleUnlike(data.id),
								style: 'destructive',
							}
						]
					)
				}
			]
		});
	}, []);

	return React.useMemo<ColumnDef<UserActivity>[]>(() => [
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
	], []);
};
