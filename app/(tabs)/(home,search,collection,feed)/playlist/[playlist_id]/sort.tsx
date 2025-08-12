import { usePlaylistFullQuery, usePlaylistGuestsQuery, usePlaylistIsAllowedToEditQuery, usePlaylistItemsQuery } from "@/features/playlist/playlistQueries";
import { PlaylistItem } from "@/types/type.db";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import * as Burnt from "burnt";
import { PostgrestError } from "@supabase/supabase-js";
import { usePlaylistItemUpdateMutation } from "@/features/playlist/playlistMutations";
import { Pressable } from "react-native-gesture-handler";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "@/components/ui/text";
import tw from "@/lib/tw";
import DraggableFlatList, { DragEndParams, RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { View } from "@/components/ui/view";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const PlaylistSortScreen = () => {
	const t = useTranslations();
	const router = useRouter();
	const { colors, inset } = useTheme();
	const { playlist_id } = useLocalSearchParams();
	const playlistId = Number(playlist_id);
	const {
		data: playlist,
	} = usePlaylistFullQuery(playlistId);
	const { data: playlistItemsRequest, isLoading: playlistItemsRequestIsLoading } = usePlaylistItemsQuery({
		playlistId: playlistId,
		initialData: playlist?.items,
	});
	const { data: guests } = usePlaylistGuestsQuery({
		playlistId: playlistId,
		initialData: playlist?.guests,
	});
	const { data: isAllowedToEdit } = usePlaylistIsAllowedToEditQuery({
		playlist: playlist || undefined,
		guests: guests,
	});
	const updatePlaylistItem = usePlaylistItemUpdateMutation();

	// States
	const [playlistItems, setPlaylistItems] = useState<PlaylistItem[] | undefined>(undefined);
	const loading = playlistItems === undefined || playlistItemsRequestIsLoading;

	// Handlers
	const handleSaveItem = async (item: PlaylistItem) => {
		try {
			await updatePlaylistItem.mutateAsync({
				id: item.id,
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
	const handleOnDragEnd = ({ from, to, data }: DragEndParams<PlaylistItem>) => {
		if (from === to) return;
		const updatedItem = data.at(to);
		updatedItem && handleSaveItem({
			...updatedItem,
			rank: to + 1,
		});
	};
	const handleQuickMove = (item: PlaylistItem) => {

	};

	// Render
	const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<PlaylistItem>) => {
		const subtitle = item.media?.main_credit?.map((director) => director.title).join(', ') || '';
		return (
			<ScaleDecorator activeScale={1.05}>
				<View
				style={[
					tw`flex-row items-center justify-between gap-2 rounded-md my-0.5`,
					{ backgroundColor: isActive ? colors.muted : colors.background }
				]}
				>
					<View style={tw`flex-row items-center gap-2`}>
						<ImageWithFallback
						alt={item.media?.title ?? ''}
						source={{ uri: item.media?.avatar_url || '' }}
						style={[{ aspectRatio: 2 / 3, height: 'fit-content' }, tw`rounded-md w-16`]}
						/>
						<View style={tw`shrink`}>
							<Text numberOfLines={1}>
								{item.media?.title ?? ''}
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

	useEffect(() => {
        if (playlistItemsRequest) {
            setPlaylistItems(playlistItemsRequest);
        }
    }, [playlistItemsRequest]);

	if (isAllowedToEdit === false) {
		return <Redirect href={'..'} />;
	}

	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: upperFirst(t('common.messages.edit_order')),
			headerLeft: router.canDismiss() ? () => (
				<Button
				variant="ghost"
				size="fit"
				onPress={router.dismiss}
				>
					{upperFirst(t('common.messages.close'))}
				</Button>
			) : undefined,
		}}
		/>
		{!loading && playlistItems?.length > 0 ? (
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
				marginBottom: inset.bottom,
			}}
			/>
		) : (
			<View style={tw`flex-1 items-center justify-center p-4`}>
				<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		)}
	</>
	)
};

export default PlaylistSortScreen;