import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Icons } from "@/constants/Icons";
import { usePlaylistMovieUpdateMutation } from "@/features/playlist/playlistMutations";
import { usePlaylistIsAllowedToEditQuery, usePlaylistItemsMovieQuery } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { PlaylistItemMovie } from "@recomendapp/types";
import { PostgrestError } from "@supabase/supabase-js";
import { Redirect, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useState } from "react";
import DraggableFlatList, { DragEndParams, RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { useTranslations } from "use-intl";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/Toast";

export const PlaylistSortMovie = () => {
	const { session } = useAuth();
	const toast = useToast();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const t = useTranslations();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id);
	const { data: playlistItemsRequest, isLoading: playlistItemsRequestIsLoading } = usePlaylistItemsMovieQuery({
		playlistId: playlistId,
	});
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlistId: playlistId,
		userId: session?.user.id,
	});
	const updatePlaylistItem = usePlaylistMovieUpdateMutation();

	// States
	const [playlistItems, setPlaylistItems] = useState<PlaylistItemMovie[] | undefined>(undefined);
	const loading = playlistItems === undefined || (playlistItemsRequest === undefined || playlistItemsRequestIsLoading);
	
	// Handlers
	const handleSaveItem = useCallback(async (item: PlaylistItemMovie) => {
		try {
			await updatePlaylistItem.mutateAsync({
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
	const handleOnDragEnd = useCallback(({ from, to, data }: DragEndParams<PlaylistItemMovie>) => {
		if (from === to) return;
		const updatedItem = data.at(to);
		updatedItem && handleSaveItem({
			...updatedItem,
			rank: to + 1,
		});
	}, [handleSaveItem]);
	const handleQuickMove = useCallback((item: PlaylistItemMovie) => {

	}, [handleSaveItem]);

	// Render
	const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<PlaylistItemMovie>) => {
		const subtitle = item.movie?.directors?.map((director) => director.name).join(', ') || '';
		return (
			<ScaleDecorator activeScale={1.05}>
				<View
				style={[
					tw`flex-row items-center justify-between gap-2 rounded-md my-0.5`,
					{ backgroundColor: isActive ? colors.muted : colors.background }
				]}
				>
					<View style={tw`flex-row items-center gap-2 shrink`}>
						<ImageWithFallback
						alt={item.movie?.title ?? ''}
						source={{ uri: item.movie?.poster_url || '' }}
						style={[{ aspectRatio: 2 / 3, height: 'fit-content' }, tw`rounded-md w-16`]}
						/>
						<View style={tw`shrink`}>
							<Text numberOfLines={1}>
								{item.movie?.title ?? ''}
							</Text>
							{subtitle && <Text style={{ color: colors.mutedForeground }} numberOfLines={1}>
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
	}, [colors]);

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
		contentContainerStyle={[
			{ backgroundColor: colors.background },
			{ paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL },
		]}
		style={{
			marginBottom: insets.bottom,
		}}
		/>
	);
};