import { useAuth } from "@/providers/AuthProvider";
import { useUserLikesQuery } from "@/features/user/userQueries";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React from "react";
import { UserActivity } from "@/types/type.db";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserActivityUpdateMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";

const LikesScreen = () => {
    const t = useTranslations();
    const { user } = useAuth();
	const updateActivity = useUserActivityUpdateMutation();
    const queryData = useUserLikesQuery({
        userId: user?.id,
    });

	// Handlers
	const handleUnlike = React.useCallback((data: UserActivity) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.heart_picks.modal.delete_confirm.description', { title: data.media!.title!, important: (chunk) => `"${chunk}"` }))),
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
	}, [updateActivity, t]);

    const sortByOptions = React.useMemo((): SortByOption<UserActivity>[] => ([
        {
            label: upperFirst(t('common.messages.date_updated')),
            value: 'created_at',
            defaultOrder: 'desc',
            sortFn: (a, b, order) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                return order === 'asc' ? aTime - bTime : bTime - aTime;
            },
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
	const bottomSheetActions = React.useMemo((): CollectionAction<UserActivity>[] => {
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
	const swipeActions = React.useMemo((): CollectionAction<UserActivity>[] => [
		{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleUnlike,
			variant: 'destructive',
			position: 'right',
		}
	], [handleUnlike, t]);

    return (
        <CollectionScreen
		queryData={queryData}
		screenTitle={upperFirst(t('common.messages.heart_pick', { count: 2 }))}
		// Search
		searchPlaceholder={upperFirst(t('pages.collection.heart_picks.search.placeholder'))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.media?.title || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.id}
		getItemMedia={(item) => item.media!}
		getItemTitle={(item) => item.media?.title || ''}
		getItemSubtitle={(item) => item.media?.main_credit?.map((director) => director.title).join(', ') || ''}
		getItemImageUrl={(item) => item.media?.avatar_url || ''}
		getItemUrl={(item) => item.media?.url || ''}
		getItemBackdropUrl={(item) => item.media?.backdrop_url || ''}
		getCreatedAt={(item) => item.created_at}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
        />
    );
};

export default LikesScreen;