import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserWatchlistMovie } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import * as Burnt from "burnt";
import { useSharedValue } from "react-native-reanimated";
import { useUserWatchlistMovieDeleteMutation } from "@/features/user/userMutations";
import { useUserWatchlistMoviesQuery } from "@/features/user/userQueries";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { useUIStore } from "@/stores/useUIStore";
import BottomSheetWatchlistMovieComment from "@/components/bottom-sheets/sheets/BottomSheetWatchlistMovieComment";

export const CollectionWatchlistMovie = ({
	navigationHeaderHeight,
} : {
	navigationHeaderHeight: number;
}) => {
	const t = useTranslations();
    const { user } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.watchlistTab.view);
    const queryData = useUserWatchlistMoviesQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.watchlist'));
	// Mutations
	const deleteWatchlistMutation = useUserWatchlistMovieDeleteMutation();
	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

	// Handlers
	const handleDeleteWatchlist = React.useCallback((data: UserWatchlistMovie) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.watchlist.modal.delete_confirm.description', { title: data.movie!.title!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deleteWatchlistMutation.mutateAsync({
							watchlistId: data.id,
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
	}, [deleteWatchlistMutation, t]);
	const handleOpenSheet = React.useCallback((data: UserWatchlistMovie) => {
		openSheet(BottomSheetWatchlistMovieComment, {
			watchlistItem: data,
		});
	}, [openSheet]);

    const sortByOptions = React.useMemo((): SortByOption<UserWatchlistMovie>[] => ([
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
			label: upperFirst(t('common.messages.release_date')),
			value: 'release_date',
			defaultOrder: 'desc',
			sortFn: (a, b, order) => {
				if (!a.movie?.release_date) return 1;
				if (!b.movie?.release_date) return -1;
				const aTime = new Date(a.movie.release_date).getTime();
				const bTime = new Date(b.movie.release_date).getTime();
				return order === 'asc' ? aTime - bTime : bTime - aTime;
			}
		},
        {
            label: upperFirst(t('common.messages.alphabetical')),
            value: 'alphabetical',
            defaultOrder: 'asc',
            sortFn: (a, b, order) => {
                const titleA = a.movie?.title ?? '';
                const titleB = b.movie?.title ?? '';
                const result = titleA.localeCompare(titleB);
                return order === 'asc' ? result : -result;
            },
        },
    ]), [t]);
	const bottomSheetActions = React.useMemo((): CollectionAction<UserWatchlistMovie>[] => {
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
	const swipeActions = React.useMemo((): CollectionAction<UserWatchlistMovie>[] => [
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

	const onItemAction = React.useCallback((data: UserWatchlistMovie) => {
		if (!bottomSheetActions?.length) return;
		const additionalItems = bottomSheetActions.map(action => ({
			icon: action.icon,
			label: action.label,
			onPress: () => action.onPress(data),
			position: action.position,
		}));
		openSheet(BottomSheetMovie, {
			movie: data.movie,
			additionalItemsTop: additionalItems.filter(action => action.position === 'top'),
			additionalItemsBottom: additionalItems.filter(action => action.position === 'bottom'),
		})
	}, [bottomSheetActions]);

    return (
	<>
        <CollectionScreen
		queryData={queryData}
		screenTitle={screenTitle}
		type="movie"
		// Search
		searchPlaceholder={upperFirst(t('common.messages.search_film', { count: 1 }))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.movie?.title || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.id}
		getItemTitle={(item) => item.movie?.title || ''}
		getItemSubtitle={(item) => item.movie?.directors?.map((director) => director.name).join(', ') || ''}
		getItemImageUrl={(item) => item.movie?.poster_url || ''}
		getItemUrl={(item) => item.movie?.url || ''}
		getItemBackdropUrl={(item) => item.movie?.backdrop_url || ''}
		getCreatedAt={(item) => item.created_at}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
		onItemAction={onItemAction}
		// Shared Values
		scrollY={scrollY}
		headerHeight={headerHeight}
		navigationHeaderHeight={navigationHeaderHeight}
		// View
		view={view}
        />
	</>
    );
};