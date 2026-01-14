import { useAuth } from "@/providers/AuthProvider";
import tw from "@/lib/tw";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Icons } from "@/constants/Icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import Switch from "@/components/ui/Switch";
import { Alert } from "react-native";
import { usePlaylistGuestsDeleteMutation, usePlaylistGuestsUpsertMutation } from "@/api/playlists/playlistMutations";
import { Profile } from "@recomendapp/types";
import Fuse from "fuse.js";
import { SearchBar } from "@/components/ui/searchbar";
import { LegendList } from "@legendapp/list";
import { CardUser } from "@/components/cards/CardUser";
import { PostgrestError } from "@supabase/supabase-js";
import app from "@/constants/app";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlaylistDetailsQuery, usePlaylistGuestsQuery } from "@/api/playlists/playlistQueries";

const RightActions = ({
	drag,
	item,
	swipeable,
	onDelete,
}: {
	drag: SharedValue<number>,
	item: Profile,
	swipeable: SwipeableMethods,
	onDelete: (userId: string) => void
}) => {
	const actionWidth = 50;
	const swipeActions = [
		{
			icon: Icons.X,
			onPress: () => onDelete(item.id!),
		},
	];
	const styleAnimation = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: (drag.value - PADDING_HORIZONTAL + actionWidth) * swipeActions.length }],
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
};

const ModalPlaylistEditGuests = () => {
	const { playlist_id } = useLocalSearchParams<{ playlist_id: string }>();
    const playlistId = Number(playlist_id);
	const router = useRouter();
	const toast = useToast();
	const { customerInfo } = useAuth();
	const t = useTranslations();
	const { mode } = useTheme();
	const insets = useSafeAreaInsets();
	const {
		data: playlist,
	} = usePlaylistDetailsQuery({
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
	const { mutateAsync: upsertGuestsMutation, isPending: isUpsertingGuests } = usePlaylistGuestsUpsertMutation({
		playlistId: playlistId,
	});
	const { mutateAsync: deleteGuestsMutation, isPending: isDeletingGuests } = usePlaylistGuestsDeleteMutation({
		playlistId: playlistId,
	});

	// States
	const [ guests, setGuests ] = useState<{ user: Profile, edit: boolean }[] | undefined>(undefined);
	useEffect(() => {
		if (guestsRequest) {
			setGuests(guestsRequest.map((guest) => ({ user: guest.user!, edit: guest.edit })));
		}
	}, [guestsRequest]);
	const [ isLoading, setIsLoading ] = useState(false);
	const canSave: boolean = (
		!!guestsRequest &&
		!!guests &&
		(
			guestsRequest.length !== guests.length ||
			guestsRequest.some((initial) => {
				const current = guests.find((g) => g.user.id === initial.user?.id);
				return !current || initial.edit !== current.edit;
			})
		)
	);

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
	const hasResults = filteredGuests && filteredGuests.length > 0;
	/* -------------------------------------------------------------------------- */


	// Handlers
	const handleToggleEdit = (userId: string) => {
		if (!customerInfo?.entitlements.active['premium']) {
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
	};
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
				await upsertGuestsMutation({
					guests: guestsToUpsert.map((guest) => ({
						user_id: guest.user.id!,
						edit: guest.edit
					})),
				}, { onError: (error) => { throw error } })
			}
			if (guestsToDelete?.length) {
				await deleteGuestsMutation({
					userIds: guestsToDelete.map((guest) => guest.user_id),
				}, { onError: (error) => { throw error } })
			}
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
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
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		} finally {
			setIsLoading(false);
		}
	};
	const handleDeleteGuest = async (userId: string) => {
		setGuests((prev) => {
			if (!prev) return prev;
			return prev.filter((guest) => guest.user.id !== userId);
		});
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
				], { userInterfaceStyle: mode }
			);
		} else {
			router.dismiss();
		}
	};
	
	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.manage_guests', { gender: 'male', count: 2 })),
				headerLeft: () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={isLoading}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				),
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
				unstable_headerLeftItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.cancel')),
						onPress: handleCancel,
						tintColor: props.tintColor,
						disabled: isUpsertingGuests || isDeletingGuests,
						icon: {
							name: "xmark",
							type: "sfSymbol",
						},
					},
				],
				unstable_headerRightItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.save')),
						onPress: handleSubmit,
						tintColor: props.tintColor,
						disabled: !canSave || isUpsertingGuests || isDeletingGuests,
						icon: {
							name: "checkmark",
							type: "sfSymbol",
						},
					},
				],
			}}
		/>
		<View style={[tw`gap-2`, { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL }]}>
			<SearchBar
			onSearch={setSearch}
			autoCorrect={false}
			autoComplete="off"
			autoCapitalize="none"
			placeholder={upperFirst(t('common.messages.search_user', { count: 1 }))}
			/>
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
		</View>
		<LegendList
		data={filteredGuests || []}
		renderItem={({ item }) => (
			<Swipeable
			friction={2}
			enableTrackpadTwoFingerGesture
			renderRightActions={(_, drag, swipeable) => (
				<RightActions
				drag={drag}
				item={item.user}
				swipeable={swipeable}
				onDelete={handleDeleteGuest}
				/>
			)}
			containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}
			>
				<CardUser user={item.user} linked={false}>
					<View>
						<Switch
						key={String(item.edit)}
						value={item.edit}
						onValueChange={() => handleToggleEdit(item.user.id!)}
						/>
					</View>
				</CardUser>
			</Swipeable>
		)}
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
		keyExtractor={(item) => item.user.id!.toString()}
		nestedScrollEnabled
		refreshing={isGuestsRequestRefetching}
		onRefresh={refetchGuests}
		contentContainerStyle={[
			tw`gap-2`,
			{ paddingBottom: insets.bottom + PADDING_VERTICAL }
		]}
		/>
	</>
	)
};

export default ModalPlaylistEditGuests;