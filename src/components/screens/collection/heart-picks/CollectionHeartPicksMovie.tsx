import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserActivityMovie } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserActivityMovieUpdateMutation } from "@/api/users/userMutations";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useUIStore } from "@/stores/useUIStore";
import { SharedValue } from "react-native-reanimated";
import { useUserHeartPicksMovieQuery } from "@/api/users/userQueries";

interface CollectionHeartPicksMovieProps {
	scrollY?: SharedValue<number>;
	headerHeight?: SharedValue<number>;
}

export const CollectionHeartPicksMovie = ({
	scrollY,
	headerHeight,
}: CollectionHeartPicksMovieProps) => {
	const t = useTranslations();
	const toast = useToast();
    const { user } = useAuth();
	const { mode } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.heartPicks.view);
	const setHeartPicksView = useUIStore((state) => state.setHeartPicksView);
    const queryData = useUserHeartPicksMovieQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.heart_pick', { count: 2 }));
	// Mutations
	const { mutateAsync: updateActivity } = useUserActivityMovieUpdateMutation();

	// Handlers
	const handleUnlike = React.useCallback((data: UserActivityMovie) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.heart_picks.modal.delete_confirm.description', { title: data.movie!.title!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await updateActivity({
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
			], {
				userInterfaceStyle: mode,
			}
		)
	}, [updateActivity, t, mode, toast]);

    const sortByOptions = React.useMemo((): SortByOption<UserActivityMovie>[] => ([
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
	const bottomSheetActions = React.useMemo((): CollectionAction<UserActivityMovie>[] => {
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
	const swipeActions = React.useMemo((): CollectionAction<UserActivityMovie>[] => [
		{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleUnlike,
			variant: 'destructive',
			position: 'right',
		}
	], [handleUnlike, t]);

	const onItemAction = React.useCallback((data: UserActivityMovie) => {
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
		getItemId={(item) => item.id}
		getItemTitle={(item) => item.movie?.title || ''}
		getItemSubtitle={(item) => item.movie?.directors?.map((director) => director.name).join(', ') || ''}
		getItemImageUrl={(item) => getTmdbImage({ path: item.movie?.poster_path, size: 'w342' }) || ''}
		getItemUrl={(item) => item.movie?.url || ''}
		getItemBackdropUrl={(item) => getTmdbImage({ path: item.movie?.backdrop_path, size: 'w780' }) || ''}
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
		onViewChange={setHeartPicksView}
        />
	</>
    );
};