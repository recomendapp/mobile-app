import { CardUser } from "@/components/cards/CardUser";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/searchbar";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { usePlaylistGuestsUpsertMutation } from "@/api/playlists/playlistMutations";
import tw from "@/lib/tw";
import { GAP, PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Profile } from "@recomendapp/types";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { PostgrestError } from "@supabase/supabase-js";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { usePlaylistGuestsAddQuery } from "@/api/playlists/playlistQueries";

const ModalPlaylistEditGuestsAdd = () => {
	const { playlist_id } = useLocalSearchParams<{ playlist_id: string }>();
	const playlistId = Number(playlist_id);
	const t = useTranslations();
	const toast = useToast();
	const router = useRouter();
	const { mode } = useTheme();
	// SharedValues
	const footerHeight = useSharedValue(0);

	// States
	const [ search, setSearch ] = useState('');
	const [ selectedUsers, setSelectedUsers ] = useState<Profile[]>([]);
	const canSave: boolean = selectedUsers.length > 0;
	const {
		data,
		isLoading,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = usePlaylistGuestsAddQuery({
		playlistId: playlistId,
		query: search,
	});
	const users = (
		data?.pages.flatMap((page) => page.data.map((user) => ({
			user,
			isSelected: selectedUsers.some((u) => u.id === user.id),
		}))) || []
	);
	// Mutations
	const { mutateAsync: upsertGuestsMutation, isPending: isUpsertingGuests } = usePlaylistGuestsUpsertMutation({
		playlistId: playlistId,
	});

	// Handlers
	const handleToggleUser = useCallback((user: Profile) => {
		setSelectedUsers((prev) => {
			const isSelected = prev.some((u) => u.id === user.id);
			if (isSelected) {
				return prev.filter((u) => u.id !== user.id);
			}
			return [...prev, user];
		});
	}, []);
	const handleSubmit = useCallback(async () => {
		try {
			if (selectedUsers.length === 0) return;
			await upsertGuestsMutation({
				guests: selectedUsers.map((guest) => ({
					user_id: guest.id!,
				})),
			}, { onError: (error) => { throw error } })
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
		}
	}, [selectedUsers, upsertGuestsMutation, toast, router, t]);
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
				], { userInterfaceStyle: mode }
			);
		} else {
			router.dismiss();
		}
	}, [canSave, router, t, mode]);


	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		return {
			marginBottom: withTiming(footerHeight.value, { duration: 200 }),
		};
	});

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.add_guest', { count: 2 })),
				headerLeft: () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={isUpsertingGuests}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				),
				headerRight: () => (
					<Button
					variant="ghost"
					size="fit"
					loading={isUpsertingGuests}
					onPress={handleSubmit}
					disabled={!canSave || isUpsertingGuests}
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
						disabled: isUpsertingGuests,
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
						disabled: !canSave || isUpsertingGuests,
						icon: {
							name: "checkmark",
							type: "sfSymbol",
						},
					},
				],
			}}
		/>
		<View style={[tw`gap-2`, { paddingHorizontal: PADDING, paddingVertical: PADDING_VERTICAL }]}>
			<SearchBar
			autoCorrect={false}
			autoComplete="off"
			autoCapitalize="none"
			onSearch={setSearch}
			placeholder={upperFirst(t('common.messages.search_user', { count: 1 }))}
			/>
		</View>
		<AnimatedLegendList
		data={users}
		renderItem={({ item }) => (
			<CardUser linked={false} onPress={() => handleToggleUser(item.user)} user={item.user} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}>
				<Checkbox
				checked={item.isSelected}
				onCheckedChange={() => handleToggleUser(item.user)}
				/>
			</CardUser>
		)}
		ListEmptyComponent={
			isLoading ? <Icons.Loader />
			: search.length ? (
				<View style={tw`p-4`}>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			) : (
				<View style={tw`items-center justify-center p-4`}>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.search_user', { count: 1 }))}
					</Text>
				</View>
			)
		}
		keyExtractor={(item) => item.user.id!.toString()}
		refreshing={isRefetching}
		onRefresh={refetch}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			{ gap: GAP },
			{ paddingBottom: PADDING_VERTICAL },
		]}
		style={animatedFooterStyle}
		/>
		<SelectionFooter
		data={selectedUsers}
		visibleHeight={footerHeight}
		renderItem={({ item }) => (
			<CardUser variant="icon" linked={false} onPress={() => handleToggleUser(item)} user={item} width={50} height={50}/>
		)}
		keyExtractor={(user) => user.id!}
		/>
	</>
	)
};

export default ModalPlaylistEditGuestsAdd;