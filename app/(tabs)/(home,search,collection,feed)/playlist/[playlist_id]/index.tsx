import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { PlaylistItem } from "@/types/type.db";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/screens/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePlaylistFullQuery, usePlaylistItemsQuery, usePlaylistIsAllowedToEditQuery, usePlaylistGuestsQuery } from "@/features/playlist/playlistQueries";
import BottomSheetPlaylist from "@/components/bottom-sheets/sheets/BottomSheetPlaylist";
import { RealtimeChannel } from "@supabase/supabase-js";
import useDebounce from "@/hooks/useDebounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { usePlaylistItemDeleteMutation, usePlaylistItemsQueryRealtimeMutation } from "@/features/playlist/playlistMutations";
import * as Burnt from "burnt";
import { CardUser } from "@/components/cards/CardUser";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { Button } from "@/components/ui/Button";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { useSharedValue } from "react-native-reanimated";
import ButtonActionPlaylistLike from "@/components/buttons/ButtonActionPlaylistLike";
import ButtonActionPlaylistSaved from "@/components/buttons/ButtonActionPlaylistSaved";

const PlaylistScreen = () => {
	const t = useTranslations();
	const router = useRouter();
	const supabase = useSupabaseClient();
	const { session } = useAuth();
	const { playlist_id } = useLocalSearchParams();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const [shouldRefresh, setShouldRefresh] = useState(false);
  	const debouncedRefresh = useDebounce(shouldRefresh, 200);
	const { data: playlist } = usePlaylistFullQuery(Number(playlist_id));
	const { data: guests } = usePlaylistGuestsQuery({
		playlistId: playlist?.id,
		initialData: playlist?.guests,
	});
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlist: playlist || undefined,
		guests: guests,
	})
	const playlistItems = usePlaylistItemsQuery({
		playlistId: playlist?.id,
		initialData: playlist?.items,
	});
	const deletePlaylistItemMutation = usePlaylistItemDeleteMutation();
	const { mutate: updatePlaylistItemChanges } = usePlaylistItemsQueryRealtimeMutation({
		playlistId: playlist?.id,
	});

	// SharedValues
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);

	// Handlers
	const handleDeletePlaylistItem = useCallback((data: PlaylistItem) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.playlist.modal.delete_confirm.description', { title: data.media!.title!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deletePlaylistItemMutation.mutateAsync({
							id: data.id,
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
	const handlePlaylistItemComment = useCallback((data: PlaylistItem) => {
		// openSheet(BottomSheetPlaylistComm, {
		// 	playlistItem: data,
		// });
	}, [openSheet]);

    const sortByOptions = useMemo((): SortByOption<PlaylistItem>[] => ([
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
	const bottomSheetActions = useMemo((): CollectionAction<PlaylistItem>[] => {
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
	const swipeActions = useMemo((): CollectionAction<PlaylistItem>[] => [
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

	// useEffects
	useEffect(() => {
		let playlistItemsChanges: RealtimeChannel;
		const setupRealtime = async () => {
			await supabase.realtime.setAuth(session?.access_token);
			playlistItemsChanges = supabase
				.channel(`playlist:${playlist?.id}`, {
					config: { private: true },
				})
				.on('broadcast', { event: '*' }, ({ event, payload } : { event: string, payload: { old: PlaylistItem, new: PlaylistItem } }) => {
					updatePlaylistItemChanges({
						playlistId: playlist?.id!,
						event,
						payload,
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
		<AnimatedStackScreen
		options={{
			headerTitle: playlist?.title ?? '',
			headerRight: playlist ? () => (
				<View style={tw`flex-row items-center`}>
					{session && playlist && session.user.id !== playlist.user_id && (
						<>
						<ButtonActionPlaylistLike playlistId={playlist.id} />
						<ButtonActionPlaylistSaved playlistId={playlist.id} />
						</>
					)}
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={() => openSheet(BottomSheetPlaylist, {
						playlist: playlist
					})}
					/>
				</View>
			) : undefined
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		/>
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
		showPoster={true}
		poster={playlist?.poster_url || undefined}
		posterType={"playlist"}
		// Search
		searchPlaceholder={upperFirst(t('pages.playlist.search.placeholder'))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.media?.title || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.id!}
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
		/>
	</>
	)
};

export default PlaylistScreen;