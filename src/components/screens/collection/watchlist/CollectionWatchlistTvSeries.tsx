import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserWatchlistTvSeries } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserWatchlistTvSeriesDeleteMutation } from "@/api/users/userMutations";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useUIStore } from "@/stores/useUIStore";
import { BottomSheetWatchlistTvSeriesComment } from "@/components/bottom-sheets/sheets/BottomSheetWatchlistTvSeriesComment";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { SharedValue } from "react-native-reanimated";
import { useUserWatchlistTvSeriesQuery } from "@/api/users/userQueries";

interface CollectionWatchlistTvSeriesProps {
	scrollY?: SharedValue<number>;
	headerHeight?: SharedValue<number>;
}

export const CollectionWatchlistTvSeries = ({
	scrollY,
	headerHeight,
} : CollectionWatchlistTvSeriesProps) => {
	const t = useTranslations();
	const toast = useToast();
    const { user } = useAuth();
	const { mode } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.watchlist.view);
	const setWatchlistView = useUIStore((state) => state.setWatchlistView);
    const queryData = useUserWatchlistTvSeriesQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.watchlist'));
	// Mutations
	const { mutateAsync: deleteWatchlistMutation } = useUserWatchlistTvSeriesDeleteMutation();

	// Handlers
	const handleDeleteWatchlist = React.useCallback((data: UserWatchlistTvSeries) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.watchlist.modal.delete_confirm.description', { title: data.tv_series!.name!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deleteWatchlistMutation({
							watchlistId: data.id,
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
	}, [deleteWatchlistMutation, t, toast, mode]);
	const handleOpenSheet = React.useCallback((data: UserWatchlistTvSeries) => {
		openSheet(BottomSheetWatchlistTvSeriesComment, {
			watchlistItem: data,
		});
	}, [openSheet]);

    const sortByOptions = React.useMemo((): SortByOption<UserWatchlistTvSeries>[] => ([
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
	const bottomSheetActions = React.useMemo((): CollectionAction<UserWatchlistTvSeries>[] => {
        return [
            {
                icon: Icons.Delete,
                label: upperFirst(t('common.messages.delete')),
                variant: 'destructive',
                onPress: handleDeleteWatchlist,
				position: 'bottom',
            },
			{
				icon: Icons.Comment,
				label: upperFirst(t('common.messages.view_comment', { count: 1})),
				onPress: handleOpenSheet,
				position: 'top',
			}
        ];
    }, [handleDeleteWatchlist, handleOpenSheet, t]);
	const swipeActions = React.useMemo((): CollectionAction<UserWatchlistTvSeries>[] => [
		{
			icon: Icons.Comment,
			label: upperFirst(t('common.messages.comment', { count: 1 })),
			onPress: handleOpenSheet,
			variant: 'accent-yellow',
			position: 'left',
		},
		{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleDeleteWatchlist,
			variant: 'destructive',
			position: 'right',
		}
	], [handleDeleteWatchlist, handleOpenSheet, t]);

	const onItemAction = React.useCallback((data: UserWatchlistTvSeries) => {
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
		getItemId={(item) => item.id}
		getItemTitle={(item) => item.tv_series?.name || ''}
		getItemSubtitle={(item) => item.tv_series?.created_by?.map((creator) => creator.name).join(', ') || ''}
		getItemImageUrl={(item) => getTmdbImage({ path: item.tv_series?.poster_path, size: 'w342' }) || ''}
		getItemUrl={(item) => item.tv_series?.url || ''}
		getItemBackdropUrl={(item) => getTmdbImage({ path: item.tv_series?.backdrop_path, size: 'w780' }) || ''}
		getCreatedAt={(item) => item.created_at}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
		onItemAction={onItemAction}
		// SharedValues
		scrollY={scrollY}
		headerHeight={headerHeight}
		// View
		defaultView={view}
		onViewChange={setWatchlistView}
        />
	</>
    );
};