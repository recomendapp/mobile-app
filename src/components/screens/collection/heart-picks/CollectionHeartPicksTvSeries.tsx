import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserActivityTvSeries } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useSharedValue } from "react-native-reanimated";
import { useUserActivityTvSeriesUpdateMutation } from "@/features/user/userMutations";
import { useUserHeartPicksTvSeriesQuery } from "@/features/user/userQueries";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useUIStore } from "@/stores/useUIStore";
import { useToast } from "@/components/Toast";

export const CollectionHeartPicksTvSeries = () => {
	const t = useTranslations();
	const toast = useToast();
    const { user } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.heartPicks.view);
    const queryData = useUserHeartPicksTvSeriesQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.heart_pick', { count: 2 }));
	// Mutations
	const updateActivity = useUserActivityTvSeriesUpdateMutation();
	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

	// Handlers
	const handleUnlike = React.useCallback((data: UserActivityTvSeries) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.heart_picks.modal.delete_confirm.description', { title: data.tv_series!.name!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await updateActivity.mutateAsync({
							activityId: data.id,
							isLiked: false,
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
			]
		)
	}, [updateActivity, t]);

    const sortByOptions = React.useMemo((): SortByOption<UserActivityTvSeries>[] => ([
        {
            label: upperFirst(t('common.messages.date_added')),
            value: 'created_at',
            defaultOrder: 'desc',
            sortFn: (a, b, order) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
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
	const bottomSheetActions = React.useMemo((): CollectionAction<UserActivityTvSeries>[] => {
        return [
            {
                icon: Icons.Delete,
                label: upperFirst(t('common.messages.delete')),
                variant: 'destructive',
                onPress: handleUnlike,
				position: 'bottom',
            }
        ];
    }, [handleUnlike, t]);
	const swipeActions = React.useMemo((): CollectionAction<UserActivityTvSeries>[] => [
		{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleUnlike,
			variant: 'destructive',
			position: 'right',
		}
	], [handleUnlike, t]);

	const onItemAction = React.useCallback((data: UserActivityTvSeries) => {
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
	}, [bottomSheetActions]);

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
		getItemId={(item) => item.id}
		getItemTitle={(item) => item.tv_series?.name || ''}
		getItemSubtitle={(item) => item.tv_series?.created_by?.map((creator) => creator.name).join(', ') || ''}
		getItemImageUrl={(item) => item.tv_series?.poster_url || ''}
		getItemUrl={(item) => item.tv_series?.url || ''}
		getItemBackdropUrl={(item) => item.tv_series?.backdrop_url || ''}
		getCreatedAt={(item) => item.created_at}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
		onItemAction={onItemAction}
		// Shared Values
		scrollY={scrollY}
		headerHeight={headerHeight}
		// View
		view={view}
        />
	</>
    );
};