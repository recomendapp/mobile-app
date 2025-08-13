import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistQuery } from "@/features/user/userQueries";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React, { use } from "react";
import { UserWatchlist } from "@/types/type.db";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useUserWatchlistDeleteMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetWatchlistComment from "@/components/bottom-sheets/sheets/BottomSheetWatchlistComment";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useSharedValue } from "react-native-reanimated";

const WatchlistScreen = () => {
	const t = useTranslations();
    const { user } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const deleteWatchlistMutation = useUserWatchlistDeleteMutation();
	const queryData = useUserWatchlistQuery({
		userId: user?.id,
	});
	const screenTitle = upperFirst(t('common.messages.watchlist'));

	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

	// Handlers
	const handleDeleteWatchlist = React.useCallback((data: UserWatchlist) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.collection.watchlist.modal.delete_confirm.description', { title: data.media!.title!, important: (chunk) => `"${chunk}"` }))),
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
	const handleOpenSheet = React.useCallback((data: UserWatchlist) => {
		openSheet(BottomSheetWatchlistComment, {
			watchlistItem: data,
		});
	}, [openSheet]);

    const sortByOptions = React.useMemo((): SortByOption<UserWatchlist>[] => ([
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
	const bottomSheetActions = React.useMemo((): CollectionAction<UserWatchlist>[] => {
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
	const swipeActions = React.useMemo((): CollectionAction<UserWatchlist>[] => [
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
		// Query
		queryData={queryData}
		screenTitle={screenTitle}
		// Search
		searchPlaceholder={upperFirst(t('pages.collection.watchlist.search.placeholder'))}
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
	)
};

export default WatchlistScreen;