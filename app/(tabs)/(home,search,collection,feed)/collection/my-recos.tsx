import { useAuth } from "@/providers/AuthProvider";
import { useUserRecosQuery } from "@/features/user/userQueries";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserRecosAggregated } from "@/types/type.db";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserRecosCompleteMutation, useUserRecosDeleteMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMyRecosSenders from "@/components/bottom-sheets/sheets/BottomSheetMyRecosSenders";
import { useSharedValue } from "react-native-reanimated";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";

const MyRecosScreen = () => {
	const t = useTranslations();
    const { user } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const deleteReco = useUserRecosDeleteMutation();
	const completeReco = useUserRecosCompleteMutation();
    const queryData = useUserRecosQuery({
        userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.my_recos'));

	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

	// Handlers
	const handleDeleteReco = React.useCallback((data: UserRecosAggregated) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.my_recos.modal.delete_confirm.description', { title: data.media!.title!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deleteReco.mutateAsync({
							userId: user!.id,
							mediaId: data.media!.id,
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
					},
					style: 'destructive',
				}
			]
		)
	}, [deleteReco, t, user]);
	const handleCompleteReco = React.useCallback((data: UserRecosAggregated) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.my_recos.modal.complete_confirm.description', { title: data.media!.title!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.complete')),
					onPress: async () => {
						await completeReco.mutateAsync({
							userId: user!.id,
							mediaId: data.media!.id,
						}, {
							onSuccess: () => {
								Burnt.toast({
									title: upperFirst(t('common.messages.completed', { count: 1, gender: 'female' })),
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
					},
					style: 'destructive',
				}
			]
		)
	}, [completeReco, deleteReco, t, user]);

    const sortByOptions = React.useMemo((): SortByOption<UserRecosAggregated>[] => ([
        {
            label: upperFirst(t('common.messages.date_added')),
            value: 'created_at',
            defaultOrder: 'desc',
            sortFn: (a, b, order) => {
                const aTime = new Date(a.created_at!).getTime();
                const bTime = new Date(b.created_at!).getTime();
                return order === 'asc' ? aTime - bTime : bTime - aTime;
            },
        },
		{
			label: upperFirst(t('common.messages.release_date')),
			value: 'release_date',
			defaultOrder: 'desc',
			sortFn: (a, b, order) => {
				if (!a.media?.date) return 1;
				if (!b.media?.date) return -1;
				const aTime = new Date(a.media.date).getTime();
				const bTime = new Date(b.media.date).getTime();
				return order === 'asc' ? aTime - bTime : bTime - aTime;
			}
		},
        {
            label: upperFirst(t('common.messages.alphabetical')),
            value: 'alphabetical',
            defaultOrder: 'asc',
            sortFn: (a, b, order) => {
                const titleA = a.media?.title ?? '';
                const titleB = b.media?.title ?? '';
                const result = titleA.localeCompare(titleB);
                return order === 'asc' ? result : -result;
            },
        },
    ]), [t]);
	const bottomSheetActions = React.useMemo((): CollectionAction<UserRecosAggregated>[] => {
        return [
            {
                icon: Icons.Delete,
                label: upperFirst(t('common.messages.delete')),
                variant: 'destructive',
                onPress: handleDeleteReco,
				position: 'bottom',
            },
			{
				icon: Icons.Check,
				label: upperFirst(t('common.messages.complete')),
				onPress: handleCompleteReco,
				position: 'top',
			},
			{
				icon: Icons.Comment,
				label: upperFirst(t('common.messages.view_recommendation', { count: 1})),
				onPress: (item) => openSheet(BottomSheetMyRecosSenders, {
					comments: item.senders,
				}),
				position: 'top',
			}
        ];
    }, [handleDeleteReco, handleCompleteReco, openSheet, t]);
	const swipeActions = React.useMemo((): CollectionAction<UserRecosAggregated>[] => [
		{
			icon: Icons.Check,
			label: upperFirst(t('common.messages.complete')),
			onPress: handleCompleteReco,
			variant: 'accent-yellow',
			position: 'left',
		},
		{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleDeleteReco,
			variant: 'destructive',
			position: 'right',
		}
	], [handleDeleteReco, handleCompleteReco, t]);

    return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: screenTitle,
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		/>
        <CollectionScreen
		queryData={queryData}
		screenTitle={screenTitle}
		// Search
		searchPlaceholder={upperFirst(t('pages.collection.my_recos.search.placeholder'))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.media?.title || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.media_id!}
		getItemMedia={(item) => item.media!}
		getItemTitle={(item) => item.media?.title || ''}
		getItemSubtitle={(item) => item.media?.main_credit?.map((director) => director.title).join(', ') || ''}
		getItemImageUrl={(item) => item.media?.avatar_url || ''}
		getItemUrl={(item) => item.media?.url || ''}
		getItemBackdropUrl={(item) => item.media?.backdrop_url || ''}
		getCreatedAt={(item) => item.created_at!}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
		// SharedValues
		scrollY={scrollY}
		headerHeight={headerHeight}
		/>
	</>
    );
};

export default MyRecosScreen;