import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Playlist, PlaylistItemTvSeries } from "@/types/type.db";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useRouter } from "expo-router";
import { usePlaylistIsAllowedToEditQuery, usePlaylistItemsTvSeriesQuery } from "@/features/playlist/playlistQueries";
import { RealtimeChannel } from "@supabase/supabase-js";
import useDebounce from "@/hooks/useDebounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { usePlaylistItemsTvSeriesRealtimeMutation, usePlaylistTvSeriesDeleteMutation } from "@/features/playlist/playlistMutations";
import * as Burnt from "burnt";
import { CardUser } from "@/components/cards/CardUser";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import BottomSheetTvSeries from "@/components/bottom-sheets/sheets/BottomSheetTvSeries";
import { useUIStore } from "@/stores/useUIStore";

interface PlaylistTvSeriesProps {
	playlist: Playlist;
	scrollY?: SharedValue<number>;
	headerHeight?: SharedValue<number>;
}

export const PlaylistTvSeries = ({
	playlist,
	scrollY = useSharedValue(0),
	headerHeight = useSharedValue(0),
} : PlaylistTvSeriesProps) => {
	const t = useTranslations();
	const router = useRouter();
	const supabase = useSupabaseClient();
	const { session } = useAuth();
	const view = useUIStore((state) => state.playlistView);
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const [shouldRefresh, setShouldRefresh] = useState(false);
  	const debouncedRefresh = useDebounce(shouldRefresh, 200);
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlistId: playlist.id,
		userId: session?.user.id,
	})
	const playlistItems = usePlaylistItemsTvSeriesQuery({
		playlistId: playlist.id,
	});
	const deletePlaylistItemMutation = usePlaylistTvSeriesDeleteMutation();
	const { mutate: updatePlaylistItemChanges } = usePlaylistItemsTvSeriesRealtimeMutation({
		playlistId: playlist?.id,
	});

	// Handlers
	const handleDeletePlaylistItem = useCallback((data: PlaylistItemTvSeries) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.playlist.modal.delete_item_confirm.description', { title: data.tv_series?.name!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deletePlaylistItemMutation.mutateAsync({
							itemId: data.id,
						}, {
							onSuccess: () => {
								Burnt.toast({
									title: upperFirst(t('common.messages.deleted', { count: 1, gender: 'male' })),
									preset: 'done',
									haptic: 'success',
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
	}, [t]);
	const handlePlaylistItemComment = useCallback((data: PlaylistItemTvSeries) => {
		// openSheet(BottomSheetPlaylistComm, {
		// 	playlistItem: data,
		// });
	}, [openSheet]);

    const sortByOptions = useMemo((): SortByOption<PlaylistItemTvSeries>[] => ([
		{
			label: upperFirst(t('common.messages.custom_sort')),
			value: 'rank',
			defaultOrder: 'asc',
			sortFn: (a, b, order) => {
				const rankA = a.rank ?? 0;
				const rankB = b.rank ?? 0;
				return order === 'asc' ? rankA - rankB : rankB - rankA;
			}
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
	const bottomSheetActions = useMemo((): CollectionAction<PlaylistItemTvSeries>[] => {
        return [
            {
                icon: Icons.Delete,
                label: upperFirst(t('common.messages.delete')),
                variant: 'destructive',
                onPress: handleDeletePlaylistItem,
				position: 'bottom',
            },
			{
				icon: Icons.Comment,
				label: upperFirst(t('common.messages.view_comment', { count: 1})),
				onPress: handlePlaylistItemComment,
				position: 'top',
			}
        ];
    }, [handleDeletePlaylistItem, handlePlaylistItemComment, t]);
	const swipeActions = useMemo((): CollectionAction<PlaylistItemTvSeries>[] => [
		{
			icon: Icons.Comment,
			label: upperFirst(t('common.messages.comment', { count: 1 })),
			onPress: handlePlaylistItemComment,
			variant: 'accent-yellow',
			position: 'left',
		},
		{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleDeletePlaylistItem,
			variant: 'destructive',
			position: 'right',
		}
	], [handlePlaylistItemComment, handleDeletePlaylistItem, t]);

	const onItemAction = useCallback((data: PlaylistItemTvSeries) => {
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

	// useEffects
	useEffect(() => {
		let playlistItemsChanges: RealtimeChannel;
		const setupRealtime = async () => {
			await supabase.realtime.setAuth(session?.access_token);
			playlistItemsChanges = supabase
				.channel(`playlist:${playlist?.id}`, {
					config: { private: true },
				})
				.on('broadcast', { event: '*' }, ({ event, payload } : { event: string, payload: { old: PlaylistItemTvSeries, new: PlaylistItemTvSeries } }) => {
					updatePlaylistItemChanges({
						event,
						payload,
					}, {
						onError: () => {
							setShouldRefresh(true);
						}
					});
				})
				.subscribe();
		}
		if (isAllowedToEdit) {
			setupRealtime().catch(console.error);
		}
		return () => {
			if (playlistItemsChanges) {
				supabase.removeChannel(playlistItemsChanges);
			}
		}
	}, [isAllowedToEdit, playlist?.id]);

	useEffect(() => {
		if (debouncedRefresh) {
			playlistItems.refetch();
			setShouldRefresh(false);
		}
	}, [debouncedRefresh, playlistItems.refetch]);

	return (
	<>
		<CollectionScreen
		// Query
		queryData={playlistItems}
		screenTitle={playlist?.title ?? ''}
		screenSubtitle={playlist?.user ? (
			<View style={tw`items-center gap-1`}>
				<CardUser variant="inline" user={playlist?.user} />
				{playlist.description && <Text textColor="muted">{playlist.description}</Text>}
			</View>
		) : <CardUser variant="inline" skeleton />}
		poster={playlist?.poster_url || undefined}
		posterType={"playlist"}
		type="tv_series"
		// Search
		searchPlaceholder={upperFirst(t('pages.playlist.search.placeholder'))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.tv_series.name || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.id!}
		getItemTitle={(item) => item.tv_series.name || ''}
		getItemSubtitle={(item) => item.tv_series.created_by?.map((creator) => creator.name).join(', ') || ''}
		getItemImageUrl={(item) => item.tv_series.poster_url || ''}
		getItemUrl={(item) => item.tv_series.url || ''}
		getItemBackdropUrl={(item) => item.tv_series.backdrop_url || ''}
		getCreatedAt={(item) => item.created_at!}
		// Actions
		bottomSheetActions={bottomSheetActions}
		swipeActions={swipeActions}
		onItemAction={onItemAction}
		// Button
		additionalToolbarItems={isAllowedToEdit ? [
			{
				label: upperFirst(t('common.messages.edit_order')),
				icon: Icons.ListOrdered,
				onPress: () => router.push(`/playlist/${playlist?.id}/sort`),
			}
		] : undefined}
		// SharedValues
		scrollY={scrollY}
		headerHeight={headerHeight}
		// View
		view={view}
		/>
	</>
	);
};
