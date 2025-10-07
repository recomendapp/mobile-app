import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserActivityMovie } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useSharedValue } from "react-native-reanimated";
import { useUserActivityMovieUpdateMutation } from "@/features/user/userMutations";
import { useUserHeartPicksMovieQuery } from "@/features/user/userQueries";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { useUIStore } from "@/stores/useUIStore";
import { useToast } from "@/components/Toast";

export const CollectionHeartPicksMovie = () => {
	const t = useTranslations();
	const toast = useToast();
    const { user } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const view = useUIStore((state) => state.heartPicks.view);
    const queryData = useUserHeartPicksMovieQuery({
		userId: user?.id,
    });
	const screenTitle = upperFirst(t('common.messages.heart_pick', { count: 2 }));
	// Mutations
	const updateActivity = useUserActivityMovieUpdateMutation();
	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

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
		// View
		view={view}
        />
	</>
    );
};