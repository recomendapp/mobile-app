import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserRecosMovieAggregated } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserRecosMovieCompleteMutation, useUserRecosMovieDeleteMutation } from "@/api/users/userMutations";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { useUIStore } from "@/stores/useUIStore";
import BottomSheetMyRecosSenders from "@/components/bottom-sheets/sheets/BottomSheetMyRecosSenders";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { SharedValue } from "react-native-reanimated";
import { useUserRecosMovieQuery } from "@/api/users/userQueries";

interface CollectionMyRecosMovieProps {
	scrollY?: SharedValue<number>;
	headerHeight?: SharedValue<number>;
}

export const CollectionMyRecosMovie = ({
	scrollY,
	headerHeight,
} : CollectionMyRecosMovieProps) => {
	const toast = useToast();
	const t = useTranslations();
	const { mode } = useTheme();
    const { user } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.myRecos.view);
	const setMyRecosView = useUIStore((state) => state.setMyRecosView);
    const queryData = useUserRecosMovieQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.my_recos', { count: 2 }));
	// Mutations
	const { mutateAsync: deleteReco } = useUserRecosMovieDeleteMutation();
	const { mutateAsync: completeReco } = useUserRecosMovieCompleteMutation();

	// Handlers
	const handleDeleteReco = React.useCallback((data: UserRecosMovieAggregated) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.my_recos.modal.delete_confirm.description', { title: data.movie!.title!, important: (chunk) => `"${chunk}"` }))),
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
							movieId: data.movie!.id,
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
	const handleCompleteReco = React.useCallback((data: UserRecosMovieAggregated) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.my_recos.modal.complete_confirm.description', { title: data.movie!.title!, important: (chunk) => `"${chunk}"` }))),
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
							movieId: data.movie!.id,
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

    const sortByOptions = React.useMemo((): SortByOption<UserRecosMovieAggregated>[] => ([
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
	const bottomSheetActions = React.useMemo((): CollectionAction<UserRecosMovieAggregated>[] => {
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
	const swipeActions = React.useMemo((): CollectionAction<UserRecosMovieAggregated>[] => [
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

	const onItemAction = React.useCallback((data: UserRecosMovieAggregated) => {
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
	}, [bottomSheetActions, openSheet]);

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
		getItemId={(item) => item.movie_id!}
		getItemTitle={(item) => item.movie?.title || ''}
		getItemSubtitle={(item) => item.movie?.directors?.map((director) => director.name).join(', ') || ''}
		getItemImageUrl={(item) => getTmdbImage({ path: item.movie?.poster_path, size: 'w342' }) || ''}
		getItemUrl={(item) => item.movie?.url || ''}
		getItemBackdropUrl={(item) => getTmdbImage({ path: item.movie?.backdrop_path, size: 'w780' }) || ''}
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