import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Burnt from 'burnt';
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Icons } from "@/constants/Icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { usePlaylistGuestsQuery, usePlaylistQuery } from "@/features/playlist/playlistQueries";
import Switch from "@/components/ui/Switch";
import { Alert } from "react-native";
import { usePlaylistGuestsDeleteMutation, usePlaylistGuestsUpsertMutation, usePlaylistUpdateMutation } from "@/features/playlist/playlistMutations";
import { User } from "@/types/type.db";
import Fuse from "fuse.js";
import { SearchBar } from "@/components/ui/searchbar";
import { LegendList } from "@legendapp/list";
import { CardUser } from "@/components/cards/CardUser";
import { PostgrestError } from "@supabase/supabase-js";
import app from "@/constants/app";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { PADDING_VERTICAL } from "@/theme/globals";

const PADDING = 16;

const ModalPlaylistEditGuests = () => {
	const { playlist_id } = useLocalSearchParams<{ playlist_id: string }>();
    const playlistId = Number(playlist_id);
	const { inset, colors } = useTheme();
	const router = useRouter();
	const { user } = useAuth();
	const t = useTranslations();
	const {
		data: playlist,
	} = usePlaylistQuery({
		playlistId: playlistId,
	});
	const {
		data: guestsRequest,
		isLoading: guestsRequestLoading,
		isRefetching: isGuestsRequestRefetching,
		refetch: refetchGuests,
	} = usePlaylistGuestsQuery({
		playlistId: playlistId,
	});
	const loading = guestsRequest === undefined || guestsRequestLoading;
	
	// Mutations
	const upsertGuestsMutation = usePlaylistGuestsUpsertMutation();
	const deleteGuestsMutation = usePlaylistGuestsDeleteMutation();

	// States
	const [ guests, setGuests ] = useState<{ user: User, edit: boolean }[] | undefined>(undefined);
	useEffect(() => {
		if (guestsRequest) {
			setGuests(guestsRequest.map((guest) => ({ user: guest.user!, edit: guest.edit })));
		}
	}, [guestsRequest]);
	const [ isLoading, setIsLoading ] = useState(false);
	const canSave = useMemo((): boolean => {
		if (!guests || !guestsRequest) return false;
		if (guestsRequest.length !== guests.length) return true;
		return guestsRequest.some((initial, index) => {
			const current = guests[index];
			return (
				initial.user!.id !== current.user.id ||
				initial.edit !== current.edit
			);
		});
	}, [guests]);

	// Search
	const [search, setSearch] = useState('');
	const [filteredGuests, setFilteredGuests] = useState<typeof guests>([]);
	const fuse = useMemo(() => {
		return new Fuse(guests || [], {
		keys: ['user.username', 'user.full_name'],
		threshold: 0.5,
		});
	}, [guests]);
	useEffect(() => {
		if (search.length > 0) {
			setFilteredGuests(fuse?.search(search).map(({ item }) => item));
		} else {
			setFilteredGuests(guests);
		}
	}, [search, guests, fuse]);
	/* -------------------------------------------------------------------------- */


	// Handlers
	const handleToggleEdit = useCallback((userId: string) => {
		if (!user?.premium) {
			router.push({ pathname: '/upgrade', params: { feature: app.features.playlist_collaborators } });
			return;
		}
		setGuests((prev) => {
			if (!prev) return prev;
			return prev.map((guest) => {
				if (guest.user.id === userId) {
					return { ...guest, edit: !guest.edit };
				}
				return guest;
			});
		});
	}, []);
	const handleDeleteGuest = useCallback(async (userId: string) => {
		setGuests((prev) => {
			if (!prev) return prev;
			return prev.filter((guest) => guest.user.id !== userId);
		});
	}, []);
	const handleSubmit = async () => {
		try {
			if (!playlist) return;
			setIsLoading(true);
			const guestsToUpsert = guests?.filter((guest) => {
				const original = guestsRequest?.find(g => g.user?.id === guest.user.id);
				if (!original) return true;
				return original.edit !== guest.edit;
			});
			const guestsToDelete = guestsRequest?.filter((guest) => !guests?.some((g) => g.user.id === guest.user?.id));
			if (guestsToUpsert?.length) {
				await upsertGuestsMutation.mutateAsync({
					playlistId: playlist.id,
					guests: guestsToUpsert.map((guest) => ({
						user_id: guest.user.id,
						edit: guest.edit
					})),
				}, { onError: (error) => { throw error } })
			}
			if (guestsToDelete?.length) {
				await deleteGuestsMutation.mutateAsync({
					playlistId: playlist.id,
					ids: guestsToDelete.map((guest) => guest.id),
				}, { onError: (error) => { throw error } })
			}
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
		} finally {
			setIsLoading(false);
		}
	};
	const handleCancel = () => {
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
	};
	const RightActions = useCallback((prog: SharedValue<number>, drag: SharedValue<number>, item: { user: User, edit: boolean }, swipeable: SwipeableMethods) => {
		const actionWidth = 50;
		const swipeActions = [
			{
				icon: Icons.X,
				onPress: () => handleDeleteGuest(item.user.id),
			},
		];
		const styleAnimation = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: (drag.value - PADDING + actionWidth) * swipeActions.length }],
				opacity: interpolate(drag.value, [0, -actionWidth * swipeActions.length], [0, 1]),
			};
		});

		return (
		<Animated.View style={[tw`rounded-r-md overflow-hidden flex-row`, styleAnimation]}>
			{swipeActions.map((action, index) => (
				<Button
					key={index}
					variant={"ghost"}
					icon={action.icon}
					style={[
						tw`h-full rounded-none`,
						{ width: actionWidth },
					]}
					size="icon"
					onPress={() => {
						action.onPress();
						swipeable.close();
					}}
				/>
			))}
		</Animated.View>
		);
	}, [])
	// Render
	const renderItems = useCallback(({ item }: { item: { user: User, edit: boolean } }) => (
		<Swipeable
		friction={2}
		enableTrackpadTwoFingerGesture
		renderRightActions={(prog, drag, swipeable) => RightActions(prog, drag, item, swipeable)}
		containerStyle={{ paddingHorizontal: PADDING }}
		>
			<CardUser user={item.user} linked={false}>
				<Switch
				key={String(item.edit)}
				value={item.edit}
				onValueChange={() => handleToggleEdit(item.user.id)}
				// disabled={!user?.premium}
				/>
			</CardUser>
		</Swipeable>
	), [handleToggleEdit]);
	const renderToolbar = useCallback(() => {
		const hasResults = filteredGuests && filteredGuests.length > 0;
		return (
			<View
			style={
				hasResults ? tw`flex-row items-center justify-between gap-2` : undefined
			}>
				<Button
				variant="muted"
				icon={Icons.Add}
				onPress={() => router.push(`/playlist/${playlistId}/edit/guests/add`)}
				>
					{upperFirst(t('common.messages.add_guest', { count: 2 }))}
				</Button>
				{hasResults && <Text textColor="muted" style={tw`text-right`}>{upperFirst(t('common.messages.can_edit'))}</Text>}
			</View>
		)
	}, [filteredGuests])

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.manage_guests', { gender: 'male', count: 2 })),
				headerLeft: router.canDismiss() ? () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={isLoading}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				) : undefined,
				headerRight: () => (
					<Button
					variant="ghost"
					size="fit"
					loading={isLoading}
					onPress={handleSubmit}
					disabled={!canSave || isLoading}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
			}}
		/>
		<View style={[tw`gap-2`, { paddingHorizontal: PADDING, paddingVertical: PADDING_VERTICAL }]}>
			<SearchBar
			onSearch={setSearch}
			autoCorrect={false}
			autoComplete="off"
			autoCapitalize="none"
			placeholder={upperFirst(t('common.messages.search_user', { count: 1 }))}
			/>
			{renderToolbar()}
		</View>
		<LegendList
		data={filteredGuests || []}
		renderItem={renderItems}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			) 
		}
		keyExtractor={(item) => item.user.id.toString()}
		nestedScrollEnabled
		refreshing={isGuestsRequestRefetching}
		onRefresh={refetchGuests}
		contentContainerStyle={[
			tw`gap-2`,
			{ paddingBottom: inset.bottom + PADDING_VERTICAL }
		]}
		/>
	</>
	)
};

export default ModalPlaylistEditGuests;