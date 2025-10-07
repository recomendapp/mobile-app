import { CardUser } from "@/components/cards/CardUser";
import AnimatedContentContainer from "@/components/ui/AnimatedContentContainer";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/searchbar";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { usePlaylistGuestsUpsertMutation } from "@/features/playlist/playlistMutations";
import { usePlaylistGuestsQuery, usePlaylistGuestsSearchInfiniteQuery } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { GAP, PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Profile } from "@recomendapp/types";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import {  useCallback, useMemo, useState } from "react";
import { Alert, ScrollViewProps } from "react-native";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { PostgrestError } from "@supabase/supabase-js";
import { Checkbox } from "@/components/ui/checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/Toast";

const ModalPlaylistEditGuestsAdd = () => {
	const { playlist_id } = useLocalSearchParams<{ playlist_id: string }>();
	const playlistId = Number(playlist_id);
	const t = useTranslations();
	const toast = useToast();
	const { session } = useAuth();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	// SharedValues
	const footerHeight = useSharedValue(0);

	// States
	const [ search, setSearch ] = useState('');
	const [ selectedUsers, setSelectedUsers ] = useState<Profile[]>([]);
	const canSave = useMemo((): boolean => {
		return selectedUsers.length > 0;
	}, [selectedUsers]);
	const { data: guests } = usePlaylistGuestsQuery({ playlistId });
	const {
		data,
		isLoading,
		isRefetching,
		isError,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
		refetch,
	} = usePlaylistGuestsSearchInfiniteQuery({
		playlistId: (!!session && guests) ? playlistId : undefined,
		query: search,
		filters: {
			exclude: [
				session?.user.id!,
				...(guests?.map((guest) => guest.user_id) || [])
			]
		}
	});
	const users = useMemo(() => (
		data?.pages.flatMap((page) => page.data.map((user) => ({
			user,
			isSelected: selectedUsers.some((u) => u.id === user.id),
		}))) || []
	), [data, selectedUsers]);

	// Mutations
	const upsertGuestsMutation = usePlaylistGuestsUpsertMutation();

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
	const handleSubmit = async () => {
		try {
			if (selectedUsers.length === 0) return;
			await upsertGuestsMutation.mutateAsync({
				playlistId: playlistId,
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
	};
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
	const renderItems = useCallback(({ item }: { item: { user: Profile, isSelected: boolean } }) => {
		return (
		<CardUser user={item.user} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}>
			<Checkbox
			checked={item.isSelected}
			onCheckedChange={() => handleToggleUser(item.user)}
			/>
		</CardUser>
		);
	}, [handleToggleUser]);
	const renderScroll = useCallback((props: ScrollViewProps) => {
        return <AnimatedContentContainer {...props} />;
    }, []);


	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		const paddingBottom =  PADDING_VERTICAL + (selectedUsers.length > 0 ? footerHeight.value : insets.bottom);
		return {
			paddingBottom: withTiming(paddingBottom, { duration: 200 }),
		};
	});

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.add_guest', { count: 2 })),
				headerLeft: router.canDismiss() ? () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={upsertGuestsMutation.isPending}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				) : undefined,
				headerRight: () => (
					<Button
					variant="ghost"
					size="fit"
					loading={upsertGuestsMutation.isPending}
					onPress={handleSubmit}
					disabled={!canSave || upsertGuestsMutation.isPending}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
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
		renderItem={renderItems}
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
		keyExtractor={useCallback((item: { user: Profile }) => item.user.id!.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		onEndReached={useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage])}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			{ gap: GAP },
			animatedFooterStyle
		]}
		renderScrollComponent={renderScroll}
		/>
		<SelectionFooter
		data={selectedUsers}
		height={footerHeight}
		renderItem={useCallback(({ item } : { item: Profile}) => (
			<CardUser variant="icon" linked={false} onPress={() => handleToggleUser(item)} user={item} width={50} height={50}/>
		), [handleToggleUser])}
		keyExtractor={(user) => user.id!}
		/>
	</>
	)
};

export default ModalPlaylistEditGuestsAdd;