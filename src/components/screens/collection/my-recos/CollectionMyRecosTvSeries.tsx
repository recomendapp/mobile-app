import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserRecosTvSeriesAggregated } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserRecosTvSeriesCompleteMutation, useUserRecosTvSeriesDeleteMutation } from "@/api/users/userMutations";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useUIStore } from "@/stores/useUIStore";
import BottomSheetMyRecosSenders from "@/components/bottom-sheets/sheets/BottomSheetMyRecosSenders";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { SharedValue } from "react-native-reanimated";
import { useUserRecosTvSeriesQuery } from "@/api/users/userQueries";

interface CollectionMyRecosTvSeriesProps {
	scrollY?: SharedValue<number>;
	headerHeight?: SharedValue<number>;
}

export const CollectionMyRecosTvSeries = ({
	scrollY,
	headerHeight,
} : CollectionMyRecosTvSeriesProps) => {
	const t = useTranslations();
	const toast = useToast();
    const { user } = useAuth();
	const { mode } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.myRecos.view);
	const setMyRecosView = useUIStore((state) => state.setMyRecosView);
    const queryData = useUserRecosTvSeriesQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.my_recos', { count: 2 }));
	// Mutations
	const { mutateAsync: deleteReco } = useUserRecosTvSeriesDeleteMutation();
	const { mutateAsync: completeReco } = useUserRecosTvSeriesCompleteMutation();
	// SharedValues

	// Handlers
	const handleDeleteReco = React.useCallback((data: UserRecosTvSeriesAggregated) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.my_recos.modal.delete_confirm.description', { title: data.tv_series!.name!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deleteReco({
							userId: user!.id,
							tvSeriesId: data.tv_series!.id,
						}, {
							onSuccess: () => {
								toast.success(upperFirst(t('common.messages.deleted', { count: 1, gender: 'male' })));
							},
							onError: () => {
								toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
							}
						});
					},
					style: 'destructive',
				}
			], {
				userInterfaceStyle: mode,
			}
		)
	}, [deleteReco, t, user, toast, mode]);
	const handleCompleteReco = React.useCallback((data: UserRecosTvSeriesAggregated) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.my_recos.modal.complete_confirm.description', { title: data.tv_series!.name!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.complete')),
					onPress: async () => {
						await completeReco({
							userId: user!.id,
							tvSeriesId: data.tv_series!.id,
						}, {
							onSuccess: () => {
								toast.success(upperFirst(t('common.messages.completed', { count: 1, gender: 'female' })));
							},
							onError: () => {
								toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
							}
						});
					},
					style: 'destructive',
				}
			], {
				userInterfaceStyle: mode,
			}
		)
	}, [completeReco, t, user, toast, mode]);

    const sortByOptions = React.useMemo((): SortByOption<UserRecosTvSeriesAggregated>[] => ([
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
			label: upperFirst(t('common.messages.number_of_seasons')),
			value: 'number_of_seasons',
			defaultOrder: 'desc',
			sortFn: (a, b, order) => {
				const seasonsA = a.tv_series?.number_of_seasons ?? 0;
				const seasonsB = b.tv_series?.number_of_seasons ?? 0;
				return order === 'asc' ? seasonsA - seasonsB : seasonsB - seasonsA;
			}
		},
        {
            label: upperFirst(t('common.messages.alphabetical')),
            value: 'alphabetical',
            defaultOrder: 'asc',
            sortFn: (a, b, order) => {
                const titleA = a.tv_series?.name ?? '';
                const titleB = b.tv_series?.name ?? '';
                const result = titleA.localeCompare(titleB);
                return order === 'asc' ? result : -result;
            },
        },
    ]), [t]);
	const bottomSheetActions = React.useMemo((): CollectionAction<UserRecosTvSeriesAggregated>[] => {
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
	const swipeActions = React.useMemo((): CollectionAction<UserRecosTvSeriesAggregated>[] => [
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

	const onItemAction = React.useCallback((data: UserRecosTvSeriesAggregated) => {
		if (!bottomSheetActions?.length) return;
		const additionalItems = bottomSheetActions.map(action => ({
			icon: action.icon,
			label: action.label,
			onPress: () => action.onPress(data),
			position: action.position,
		}));
		openSheet(BottomSheetTvSeries, {
			tvSeries: data.tv_series,
			additionalItemsTop: additionalItems.filter(action => action.position === 'top'),
			additionalItemsBottom: additionalItems.filter(action => action.position === 'bottom'),
		})
	}, [bottomSheetActions, openSheet]);

    return (
	<>
        <CollectionScreen
		queryData={queryData}
		screenTitle={screenTitle}
		type="tv_series"
		// Search
		searchPlaceholder={upperFirst(t('common.messages.search_tv_series', { count: 1 }))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.tv_series?.name || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.tv_series_id!}
		getItemTitle={(item) => item.tv_series?.name || ''}
		getItemSubtitle={(item) => item.tv_series?.created_by?.map((creator) => creator.name).join(', ') || ''}
		getItemImageUrl={(item) => getTmdbImage({ path: item.tv_series?.poster_path, size: 'w342' }) || ''}
		getItemUrl={(item) => item.tv_series?.url || ''}
		getItemBackdropUrl={(item) => getTmdbImage({ path: item.tv_series?.backdrop_path, size: 'w780' }) || ''}
		getCreatedAt={(item) => item.created_at!}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
		onItemAction={onItemAction}
		// SharedValues
		scrollY={scrollY}
		headerHeight={headerHeight}
		// View
		defaultView={view}
		onViewChange={setMyRecosView}
        />
	</>
    );
};