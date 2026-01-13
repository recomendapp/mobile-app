import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Icons } from "@/constants/Icons";
import { usePlaylistTvSeriesUpdateMutation } from "@/api/playlists/playlistMutations";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { PlaylistItemTvSeries } from "@recomendapp/types";
import { PostgrestError } from "@supabase/supabase-js";
import { Redirect, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useState } from "react";
import DraggableFlatList, { DragEndParams, RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { useTranslations } from "use-intl";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/Toast";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useHeaderHeight } from "@react-navigation/elements";
import { usePlaylistIsAllowedToEditQuery, usePlaylistItemsTvSeriesQuery } from "@/api/playlists/playlistQueries";

export const PlaylistSortTvSeries = () => {
	const { session } = useAuth();
	const toast = useToast();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const t = useTranslations();
	const headerHeight = useHeaderHeight();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id);
	const { data: playlistItemsRequest, isLoading: playlistItemsRequestIsLoading } = usePlaylistItemsTvSeriesQuery({
		playlistId: playlistId,
	});
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlistId: playlistId,
		userId: session?.user.id,
	});
	const { mutateAsync: updatePlaylistItem } = usePlaylistTvSeriesUpdateMutation();

	// States
	const [playlistItems, setPlaylistItems] = useState<PlaylistItemTvSeries[] | undefined>(undefined);
	const loading = playlistItems === undefined || (playlistItemsRequest === undefined || playlistItemsRequestIsLoading);
	
	// Handlers
	const handleSaveItem = useCallback(async (item: PlaylistItemTvSeries) => {
		try {
			await updatePlaylistItem({
				itemId: item.id,
				rank: item.rank,
			});
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (error instanceof PostgrestError) {
				errorMessage = error.message;
			} else if (typeof error === 'string') {
				errorMessage = error;
			}
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		}
	}, [updatePlaylistItem, t, toast]);
	const handleOnDragEnd = useCallback(({ from, to, data }: DragEndParams<PlaylistItemTvSeries>) => {
		if (from === to) return;
		const updatedItem = data.at(to);
		updatedItem && handleSaveItem({
			...updatedItem,
			rank: to + 1,
		});
	}, [handleSaveItem]);
	const handleQuickMove = useCallback((item: PlaylistItemTvSeries) => {
		// Implement quick move logic here
	}, []);

	// Render
	const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<PlaylistItemTvSeries>) => {
		const subtitle = item.tv_series?.created_by?.map((creator) => creator.name).join(', ') || '';
		return (
			<ScaleDecorator activeScale={1.05}>
				<View
				style={[
					tw`flex-row items-center justify-between gap-2 rounded-md my-0.5`,
				]}
				>
					<View style={tw`flex-row items-center gap-2 shrink`}>
						<ImageWithFallback
						alt={item.tv_series?.name ?? ''}
						source={{ uri: getTmdbImage({ path: item.tv_series?.poster_path, size: 'w185' }) || '' }}
						style={[{ aspectRatio: 2 / 3, height: 'fit-content' }, tw`rounded-md w-12`]}
						/>
						<View style={tw`shrink`}>
							<Text numberOfLines={1}>
								{item.tv_series?.name ?? ''}
							</Text>
							{subtitle && <Text style={[tw`text-xs`, { color: colors.mutedForeground }]} numberOfLines={1}>
								{subtitle}
							</Text>}
						</View>
					</View>
					<Button
					variant="ghost"
					icon={Icons.Menu}
					iconProps={{ color: colors.mutedForeground }}
					size="icon"
					onPress={() => handleQuickMove(item)}
					onLongPress={drag}
					disabled={isActive}
					/>
				</View>
			</ScaleDecorator>
		);
	}, [colors, handleQuickMove]);

	// useEffects
	useEffect(() => {
		if (playlistItemsRequest) {
			setPlaylistItems(playlistItemsRequest);
		}
	}, [playlistItemsRequest]);

	if (isAllowedToEdit === false) {
		return <Redirect href={'..'} />;
	}

	// Returns
	if (loading) {
		return (
			<View><Icons.Loader /></View>
		);
	}

	if (playlistItems.length  === 0) {
		return (
			<View style={tw`flex-1 items-center justify-center p-4`}>
				<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		);
	}

	return (
		<DraggableFlatList
		data={playlistItems}
		onDragEnd={handleOnDragEnd}
		renderItem={renderItem}
		keyExtractor={(item) => item.id.toString()}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: PADDING_VERTICAL + insets.bottom,
			paddingTop: headerHeight
		}}
		/>
	);
};