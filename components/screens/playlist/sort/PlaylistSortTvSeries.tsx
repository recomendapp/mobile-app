import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Icons } from "@/constants/Icons";
import { usePlaylistTvSeriesUpdateMutation } from "@/features/playlist/playlistMutations";
import { usePlaylistIsAllowedToEditQuery, usePlaylistItemsTvSeriesQuery } from "@/features/playlist/playlistQueries";
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
import * as Burnt from "burnt";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const PlaylistSortTvSeries = () => {
	const { session } = useAuth();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const t = useTranslations();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id);
	const { data: playlistItemsRequest, isLoading: playlistItemsRequestIsLoading } = usePlaylistItemsTvSeriesQuery({
		playlistId: playlistId,
	});
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlistId: playlistId,
		userId: session?.user.id,
	});
	const updatePlaylistItem = usePlaylistTvSeriesUpdateMutation();

	// States
	const [playlistItems, setPlaylistItems] = useState<PlaylistItemTvSeries[] | undefined>(undefined);
	const loading = playlistItems === undefined || (playlistItemsRequest === undefined || playlistItemsRequestIsLoading);
	
	// Handlers
	const handleSaveItem = async (item: PlaylistItemTvSeries) => {
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
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: errorMessage,
					preset: 'error',
					haptic: 'error',
				});
			}
	};
	const handleOnDragEnd = ({ from, to, data }: DragEndParams<PlaylistItemTvSeries>) => {
		if (from === to) return;
		const updatedItem = data.at(to);
		updatedItem && handleSaveItem({
			...updatedItem,
			rank: to + 1,
		});
	};
	const handleQuickMove = (item: PlaylistItemTvSeries) => {
	};

	// Render
	const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<PlaylistItemTvSeries>) => {
		const subtitle = item.tv_series?.created_by?.map((creator) => creator.name).join(', ') || '';
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
						alt={item.tv_series?.name ?? ''}
						source={{ uri: item.tv_series?.poster_url || '' }}
						style={[{ aspectRatio: 2 / 3, height: 'fit-content' }, tw`rounded-md w-16`]}
						/>
						<View style={tw`shrink`}>
							<Text numberOfLines={1}>
								{item.tv_series?.name ?? ''}
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