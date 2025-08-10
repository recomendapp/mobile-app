import BottomSheetPlaylistCreate from "@/components/bottom-sheets/sheets/BottomSheetPlaylistCreate";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useMediaDetailsQuery } from "@/features/media/mediaQueries";
import { usePlaylistAddMediaMutation } from "@/features/playlist/playlistMutations";
import { useAuth } from "@/providers/AuthProvider";
import { Playlist, PlaylistType } from "@/types/type.db";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollViewProps } from "react-native";
import { useTranslations } from "use-intl";
import { z } from "zod";
import * as Burnt from "burnt";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import { Pressable } from "react-native-gesture-handler";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import tw from "@/lib/tw";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SearchBar } from "@/components/ui/searchbar";
import { PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { useUserAddMediaToPlaylistQuery } from "@/features/user/userQueries";
import { useTheme } from "@/providers/ThemeProvider";
import AnimatedContentContainer from "@/components/ui/AnimatedContentContainer";
import Fuse from "fuse.js";
import { Icons } from "@/constants/Icons";
import { Badge } from "@/components/ui/Badge";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import { Input } from "@/components/ui/Input";

const COMMENT_MAX_LENGTH = 180;

const PlaylistAddMedia = () => {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { colors, inset } = useTheme();
	const { session } = useAuth();
	const { media_id, media_title } = useLocalSearchParams();
	const mediaId = Number(media_id);
	const mediaTitle = media_title;

	// Form
	const addMediaToPlaylistFormSchema = z.object({
		comment: z.string()
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/, {
				message: t('pages.playlist.form.error.format'),
			})
			.optional()
			.nullable(),
	});
	type AddMediaToPlaylistFormValues = z.infer<typeof addMediaToPlaylistFormSchema>;
	const defaultValues: Partial<AddMediaToPlaylistFormValues> = {
		comment: '',
	};
	const form = useForm<AddMediaToPlaylistFormValues>({
		resolver: zodResolver(addMediaToPlaylistFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Mutations
	const addToPlaylistMutation = usePlaylistAddMediaMutation();

	// REFs
	const BottomSheetPlaylistCreateRef = useRef<TrueSheet>(null);

	// SharedValues
	const footerHeight = useSharedValue(0);

	// States
	const [view, setView] = useState<PlaylistType>('personal');
	const [search, setSearch] = useState('');
	const [results, setResults] = useState<typeof playlists>([]);
	const [selected, setSelected] = useState<Playlist[]>([]);
	const canSave = useMemo(() => {
		return selected.length > 0 && form.formState.isValid;
	}, [selected, form.formState.isValid]);

	// Queries
	const {
		data: playlists,
		isRefetching,
		refetch,
	} = useUserAddMediaToPlaylistQuery({
		userId: session?.user?.id,
		mediaId: mediaId,
		type: view,
	});

	// Search
	const fuse = useMemo(() => {
		return new Fuse(playlists || [], {
			keys: ['playlist.title'],
			threshold: 0.5,
		});
	}, [playlists]);
	useEffect(() => {
		if (search && search.length > 0) {
			setResults(fuse?.search(search).map(result => result.item));
		} else {
			setResults(playlists);
		}
	}, [search, playlists, fuse]);

	// Handlers
	const handleTogglePlaylist = useCallback((playlist: Playlist) => {
		setSelected((prev) => {
			const isSelected = prev.some((p) => p.id === playlist.id);
			if (isSelected) {
				return prev.filter((p) => p.id !== playlist.id);
			}
			return [...prev, playlist];
		});
	}, []);
	const handleSubmit = async (values: AddMediaToPlaylistFormValues) => {
		try {
			if (selected.length === 0) return;
			await addToPlaylistMutation.mutateAsync({
				userId: session?.user.id!,
				mediaId: mediaId,
				playlists: selected,
				comment: values.comment || undefined,
			}, {
				onError: (error) => {
					throw error;
				}
			})
			Burnt.toast({
				title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
				preset: 'done',
			});
			router.dismiss();
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (typeof error === 'string') {
				errorMessage = error;
			}
			Burnt.toast({
				title: errorMessage,
				preset: 'error',
				haptic: 'error',
			});
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

	// Render
	const renderItems = useCallback(({ item: { item, isSelected} }: { item: { item: { playlist: Playlist, already_added: boolean }, isSelected: boolean }}) => {
		return (
		<Pressable onPress={() => handleTogglePlaylist(item.playlist)} style={[tw`flex-row items-center justify-between gap-2`, { paddingHorizontal: PADDING_HORIZONTAL }]}>
			<View style={tw`shrink flex-row items-center gap-2`}>
				<ImageWithFallback
				source={{ uri: item.playlist.poster_url ?? '' }}
				alt={item.playlist.title}
				style={tw`rounded-md w-14 h-14`}
				type="playlist"
				/>
				<Text style={tw`shrink`} numberOfLines={1}>{item.playlist.title}</Text>
			</View>
			<View style={tw`flex-row items-center gap-2 shrink-0`}>
				{item.already_added && (
				<Badge variant="destructive">
					{upperFirst(t('common.messages.already_added', { count: 1, gender: 'male' }))}
				</Badge>
				)}
				<Icons.Check size={20} style={[{ color: colors.foreground }, tw`${!isSelected ? 'opacity-0' : ''}`]} />
			</View>
        </Pressable>
		);
	}, [handleTogglePlaylist]);
	const renderScroll = useCallback((props: ScrollViewProps) => {
        return <AnimatedContentContainer {...props} />;
    }, []);

	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		const paddingBottom =  PADDING_VERTICAL + (selected.length > 0 ? footerHeight.value : inset.bottom);
		return {
			paddingBottom: withTiming(paddingBottom, { duration: 200 }),
		};
	});

	// useEffects
	useEffect(() => {
		return () => {
			BottomSheetPlaylistCreateRef.current?.dismiss();
		};
	}, []);

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.add_to_playlist')),
				headerLeft: router.canDismiss() ? () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={addToPlaylistMutation.isPending}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				) : undefined,
				headerRight: () => (
					<Button
					variant="ghost"
					size="fit"
					loading={addToPlaylistMutation.isPending}
					onPress={form.handleSubmit(handleSubmit)}
					disabled={!canSave || addToPlaylistMutation.isPending}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
				headerStyle: {
					backgroundColor: colors.muted,
				},
			}}
		/>
		<View style={[tw`gap-2`, { paddingHorizontal: PADDING, paddingVertical: PADDING_VERTICAL }]}>
			<SearchBar
			autoCorrect={false}
			autoComplete="off"
			autoCapitalize="none"
			onSearch={setSearch}
			placeholder={upperFirst(t('common.messages.search_playlist', { count: 1 }))}
			/>
			<Button
			variant="muted"
			onPress={() => {
				setView((prev) => prev === 'personal' ? 'saved' : 'personal')
			}}
			>
				{view === 'saved' ? upperFirst(t('common.messages.my_playlist', { count: 2 })) : upperFirst(t('common.messages.saved', { gender: 'female', count: 2 }))}
			</Button>
			{view === 'personal' && (
				<Button variant="muted" icon={Icons.Add} onPress={() => BottomSheetPlaylistCreateRef.current?.present()}>
					{t('pages.playlist.actions.create')}
				</Button>
			)}
		</View>
		<AnimatedLegendList
		data={results?.map((item) => ({
			item: item,
			isSelected: selected.some((selectedItem) => selectedItem.id === item.playlist.id),
		})) || []}
		renderItem={renderItems}
		ListEmptyComponent={
			addToPlaylistMutation.isPending ? <Icons.Loader />
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
		keyExtractor={({ item }) => item.playlist.id.toString()}
		refreshing={isRefetching}
		onRefresh={refetch}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			tw`gap-2`,
			animatedFooterStyle
		]}
		renderScrollComponent={renderScroll}
		/>
		<SelectionFooter
		data={selected}
		height={footerHeight}
		renderItem={({ item }) => (
			<Pressable
			key={item.id}
			onPress={() => setSelected((prev) => prev.filter(
			(selectedPlaylist) => selectedPlaylist?.id !== item.id
			))}
			>
				<ImageWithFallback
				source={{ uri: item.poster_url ?? '' }}
				alt={item.title}
				style={tw`rounded-md w-10 h-10`}
				type="playlist"
				/>
			</Pressable>
		)}
		keyExtractor={(item) => item.id.toString()}
		>
			<Controller
			name="comment"
			control={form.control}
			render={({ field: { onChange, onBlur, value } }) => (
				<Input
				icon={Icons.Comment}
				placeholder={upperFirst(t('common.messages.add_comment', { count: 1 }))}
				autoCapitalize="sentences"
				value={value || ''}
				onChangeText={onChange}
				onBlur={onBlur}
				disabled={addToPlaylistMutation.isPending}
				error={form.formState.errors.comment?.message}
				/>
			)}
			/>
		</SelectionFooter>

		<BottomSheetPlaylistCreate
		ref={BottomSheetPlaylistCreateRef}
		id={`${mediaId}-create-playlist`}
		onCreate={(playlist) => {
			BottomSheetPlaylistCreateRef.current?.dismiss();
			queryClient.setQueryData(userKeys.addMediaToPlaylist({
				userId: session?.user?.id!,
				mediaId: mediaId,
				type: 'personal',
			}), (prev: { playlist: Playlist; already_added: boolean }[] | undefined) => {
				if (!prev) return [{ playlist, already_added: false }];
				return [
					{ playlist, already_added: false },
					...prev,
				];
			});
			setSelected((prev) => [...prev, playlist]);
		}}
		placeholder={String(mediaTitle)}
		/>
	</>
	)
};

export default PlaylistAddMedia;