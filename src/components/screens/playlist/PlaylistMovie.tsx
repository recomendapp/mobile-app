import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Playlist, PlaylistItemMovie } from "@recomendapp/types";
import CollectionScreen, { CollectionAction, SortByOption } from "@/components/collection/CollectionScreen";
import { Icons } from "@/constants/Icons";
import { Alert } from "react-native";
import richTextToPlainString from "@/utils/richTextToPlainString";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useRouter } from "expo-router";
import { RealtimeChannel } from "@supabase/supabase-js";
import useDebounce from "@/hooks/useDebounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { usePlaylistItemsMovieRealtimeMutation, usePlaylistMovieDeleteMutation, usePlaylistMovieUpdateMutation } from "@/api/playlists/playlistMutations";
import { CardUser } from "@/components/cards/CardUser";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { SharedValue } from "react-native-reanimated";
import BottomSheetMovie from "@/components/bottom-sheets/sheets/BottomSheetMovie";
import { BottomSheetComment } from "@/components/bottom-sheets/sheets/BottomSheetComment";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useUIStore } from "@/stores/useUIStore";
import { useQuery } from "@tanstack/react-query";
import { usePlaylistIsAllowedToEditQuery, usePlaylistItemsMovieQuery } from "@/api/playlists/playlistQueries";

interface PlaylistMovieProps {
	playlist: Playlist;
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
}

export const PlaylistMovie = ({
	playlist,
	scrollY,
	headerHeight,
} : PlaylistMovieProps) => {
	const t = useTranslations();
	const toast = useToast();
	const router = useRouter();
	const supabase = useSupabaseClient();
	const { session } = useAuth();
	const { mode } = useTheme();
	const view = useUIStore((state) => state.playlistView);
	const setPlaylistView = useUIStore((state) => state.setPlaylistView);
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const [shouldRefresh, setShouldRefresh] = useState(false);
  	const debouncedRefresh = useDebounce(shouldRefresh, 200);
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlistId: playlist.id,
		userId: session?.user.id,
	});
	const playlistItems = usePlaylistItemsMovieQuery({
		playlistId: playlist.id,
	});
	const { mutateAsync: deletePlaylistItemMutation } = usePlaylistMovieDeleteMutation();
	const { mutateAsync: updatePlaylistItemMutation } = usePlaylistMovieUpdateMutation();
	const { mutate: updatePlaylistItemChanges } = usePlaylistItemsMovieRealtimeMutation({
		playlistId: playlist?.id,
	});

	// Handlers
	const handleDeletePlaylistItem = useCallback((data: PlaylistItemMovie) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(richTextToPlainString(t.rich('pages.playlist.modal.delete_item_confirm.description', { title: data.movie?.title!, important: (chunk) => `"${chunk}"` }))),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: async () => {
						await deletePlaylistItemMutation({
							itemId: data.id,
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
	}, [t, deletePlaylistItemMutation, toast, mode]);
	const handlePlaylistItemComment = useCallback((data: PlaylistItemMovie) => {
		openSheet(BottomSheetComment, {
			comment: data.comment || '',
			isAllowedToEdit: isAllowedToEdit,
			onSave: async (newComment) => {
				await updatePlaylistItemMutation({
					itemId: data.id,
					comment: newComment?.replace(/\s+/g, ' ').trimStart() || null,
				}, {
					onError: () => {
						toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
					}
				})
			}
		});
	}, [openSheet, isAllowedToEdit, updatePlaylistItemMutation, t, toast]);

    const sortByOptions = useMemo((): SortByOption<PlaylistItemMovie>[] => ([
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
	const bottomSheetActions = useMemo((): CollectionAction<PlaylistItemMovie>[] => {
        return [
            ...(isAllowedToEdit ? [{
                icon: Icons.Delete,
                label: upperFirst(t('common.messages.delete')),
                variant: 'destructive',
                onPress: handleDeletePlaylistItem,
				position: 'bottom',
            }] as const : []),
			{
				icon: Icons.Comment,
				label: upperFirst(t('common.messages.view_comment', { count: 1})),
				onPress: handlePlaylistItemComment,
				position: 'top',
			}
        ];
    }, [handleDeletePlaylistItem, handlePlaylistItemComment, t, isAllowedToEdit]);
	const swipeActions = useMemo((): CollectionAction<PlaylistItemMovie>[] => [
		{
			icon: Icons.Comment,
			label: upperFirst(t('common.messages.comment', { count: 1 })),
			onPress: handlePlaylistItemComment,
			variant: 'accent-yellow',
			position: 'left',
		},
		...(isAllowedToEdit ? [{
			icon: Icons.Delete,
			label: upperFirst(t('common.messages.delete')),
			onPress: handleDeletePlaylistItem,
			variant: 'destructive',
			position: 'right',
		}] as const : []),
	], [handlePlaylistItemComment, handleDeletePlaylistItem, t, isAllowedToEdit]);

	const onItemAction = useCallback((data: PlaylistItemMovie) => {
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

	// useEffects
	useEffect(() => {
		let playlistItemsChanges: RealtimeChannel;
		const setupRealtime = async () => {
			await supabase.realtime.setAuth(session?.access_token);
			playlistItemsChanges = supabase
				.channel(`playlist:${playlist?.id}`, {
					config: { private: true },
				})
				.on('broadcast', { event: '*' }, ({ event, payload } : { event: string, payload: { old: PlaylistItemMovie, new: PlaylistItemMovie } }) => {
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
		type="movie"
		// Search
		searchPlaceholder={upperFirst(t('pages.playlist.search.placeholder'))}
		fuseKeys={[
			{
				name: 'title',
				getFn: (item) => item.movie.title || '',
			},
		]}
		// Sort
		sortByOptions={sortByOptions}
		// Getters
		getItemId={(item) => item.id!}
		getItemTitle={(item) => item.movie.title || ''}
		getItemSubtitle={(item) => item.movie.directors?.map((director) => director.name).join(', ') || ''}
		getItemImageUrl={(item) => getTmdbImage({ path: item.movie?.poster_path, size: 'w342' }) || ''}
		getItemUrl={(item) => item.movie.url || ''}
		getItemBackdropUrl={(item) => getTmdbImage({ path: item.movie?.backdrop_path, size: 'w780' }) || ''}
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
		defaultView={view}
		onViewChange={setPlaylistView}
		/>
	</>
	);
};
