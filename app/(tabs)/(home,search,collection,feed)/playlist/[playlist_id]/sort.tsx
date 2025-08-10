import { Button } from "@/components/ui/Button";
import { usePlaylistFullQuery, usePlaylistGuestsQuery, usePlaylistIsAllowedToEditQuery, usePlaylistItemsQuery } from "@/features/playlist/playlistQueries";
import { PlaylistItem } from "@/types/type.db";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslations } from "use-intl";
import * as Burnt from "burnt";
import { PostgrestError } from "@supabase/supabase-js";
import { usePlaylistItemsUpsertMutation } from "@/features/playlist/playlistMutations";
import { GestureHandlerRootView, Pressable } from "react-native-gesture-handler";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "@/components/ui/text";
import tw from "@/lib/tw";
import {
  Sortable,
  SortableItem,
  SortableRenderItemProps,
} from "react-native-reanimated-dnd";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";

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
	const upsertPlaylistItems = usePlaylistItemsUpsertMutation();

	// States
	const [ playlistItems, setPlaylistItems ] = useState<PlaylistItem[] | undefined>(undefined);
	const loading = playlistItems === undefined || playlistItemsRequestIsLoading;
	const canSave = useMemo(() => {
		return false;
	}, [playlistItemsRequest, playlistItems]);

	// TESTING
	// const [tasks, setTasks] = useState<Task[]>([
	// 	{ id: "1", title: "Learn React Native", completed: false },
	// 	{ id: "2", title: "Build an app", completed: false },
	// 	{ id: "3", title: "Deploy to store", completed: true },
	// 	{ id: "4", title: "Celebrate success", completed: false },
	// ]);
	// generate random tasks
	const [tasks, setTasks] = useState<Task[]>(Array.from({ length: 200 }, (_, i) => ({
		id: `${i + 1}`,
		title: `Task ${i + 1}`,
		completed: Math.random() < 0.5,
	})));

	// Handlers
	const handleSubmit = useCallback(() => {
		try {
			// LOGIC HERE
			Burnt.toast({
				title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
				preset: 'done',
			});
			router.dismiss();
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
	}, []);
	const handleCancel = useCallback(() => {
		if (canSave) {
			Alert.alert(
				upperFirst(t('common.messages.are_u_sure')),
				upperFirst(t('common.messages.do_you_really_want_to_cancel_change', { count: 2 })),
				[
					{
						text: upperFirst(t('common.messages.continue_editing')),
					},
					{
						text: upperFirst(t('common.messages.ignore')),
						onPress: () => router.dismiss(),
						style: 'destructive',
					},
				]
			);
		} else {
			router.dismiss();
		}
	}, [canSave, router, t]);

	// Render
	const renderItem = useCallback((props: SortableRenderItemProps<Task>) => {
		const {
			item,
			id,
			positions,
			lowerBound,
			autoScrollDirection,
			itemsCount,
			itemHeight,
		} = props;
		console.log('renderItem', id);
		return (
		<SortableItem
          key={id}
          data={item}
          id={id}
          positions={positions}
          lowerBound={lowerBound}
          autoScrollDirection={autoScrollDirection}
          itemsCount={itemsCount}
          itemHeight={itemHeight}
          onMove={(itemId, from, to) => {
            // const newTasks = [...tasks];
            // const [movedTask] = newTasks.splice(from, 1);
            // newTasks.splice(to, 0, movedTask);
            // setTasks(newTasks);
			console.log('onMove', itemId, from, to);
          }}
          style={{
			height: 80,
		  }}
        >
			<View style={tw`flex-row items-center justify-between gap-2`}>
				<Text>{item.title}</Text>
				<SortableItem.Handle style={tw`p-2`}>
					<Icons.Menu color={colors.mutedForeground} />
				</SortableItem.Handle>
			</View>
		</SortableItem>
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

	console.log('re-render', loading)

	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: upperFirst(t('common.messages.edit_order')),
			headerLeft: router.canDismiss() ? () => (
				<Button
				variant="ghost"
				size="fit"
				disabled={upsertPlaylistItems.isPending}
				onPress={handleCancel}
				>
					{upperFirst(t('common.messages.cancel'))}
				</Button>
			) : undefined,
			headerRight: () => (
				<Button
				variant="ghost"
				size="fit"
				loading={upsertPlaylistItems.isPending}
				onPress={handleSubmit}
				disabled={!canSave || upsertPlaylistItems.isPending}
				>
					{upperFirst(t('common.messages.save'))}
				</Button>
			),
		}}
		/>
		{!loading && playlistItems?.length > 0 ? (
			<GestureHandlerRootView style={tw`flex-1`}>

				<Sortable
				data={tasks}
				renderItem={renderItem}
				itemKeyExtractor={(item) => item.id.toString()}
				itemHeight={80}
				contentContainerStyle={{
					backgroundColor: colors.background,
				}}
				style={{
					marginBottom: inset.bottom,
				}}
				
				/>
			</GestureHandlerRootView>
		) : (
			<View style={tw`flex-1 items-center justify-center p-4`}>
				<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		)}
		{/* <DraggableFlatList
		data={playlistItems}
		onDragEnd={({ data }) => console.log('onDragEnd', data)}
		keyExtractor={(item) => item.id.toString()}
		renderItem={renderItem}
		// containerStyle={{
		// 	paddingBottom: inset.bottom,
		// }}
		autoscrollSpeed={50}
		autoscrollThreshold={5}
		// autoscrollSpeed={100}
		// autoscrollThreshold={0}
		style={{ backgroundColor: colors.background, paddingBottom: inset.bottom }}
		/> */}
	</>
	)
};

export default PlaylistSortScreen;