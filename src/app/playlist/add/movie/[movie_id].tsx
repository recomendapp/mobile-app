import BottomSheetPlaylistCreate from "@/components/bottom-sheets/sheets/BottomSheetPlaylistCreate";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { usePlaylistMovieInsertMutation } from "@/api/playlists/playlistMutations";
import { useAuth } from "@/providers/AuthProvider";
import { Playlist, PlaylistSource } from "@recomendapp/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable } from "react-native";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import tw from "@/lib/tw";
import Animated, { FadeInRight, FadeOutRight, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SearchBar } from "@/components/ui/searchbar";
import { PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import Fuse from "fuse.js";
import { Icons } from "@/constants/Icons";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/Toast";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { usePlaylistMovieAddToQuery } from "@/api/playlists/playlistQueries";
import { playlistMovieAddToOptions } from "@/api/playlists/playlistOptions";

const COMMENT_MAX_LENGTH = 180;

const PlaylistMovieAdd = () => {
	const t = useTranslations();
	const router = useRouter();
	const supabase = useSupabaseClient();
	const queryClient = useQueryClient();
	const toast = useToast();
	const { session } = useAuth();
	const { movie_id, movie_title } = useLocalSearchParams();
	const movieId = Number(movie_id);
	const movieTitle = movie_title;

	// Form
	const addMovieToPlaylistFormSchema = z.object({
		comment: z.string()
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/)
			.optional()
			.nullable(),
	});
	type AddMovieToPlaylistFormValues = z.infer<typeof addMovieToPlaylistFormSchema>;
	const defaultValues: Partial<AddMovieToPlaylistFormValues> = {
		comment: '',
	};
	const form = useForm<AddMovieToPlaylistFormValues>({
		resolver: zodResolver(addMovieToPlaylistFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Mutations
	const { mutateAsync: addToPlaylistMutation, isPending: isAddingToPlaylist } = usePlaylistMovieInsertMutation({
		movieId: movieId,
	});

	// REFs
	const BottomSheetPlaylistCreateRef = useRef<TrueSheet>(null);

	// SharedValues
	const footerHeight = useSharedValue(0);

	// States
	const [source, setSource] = useState<PlaylistSource>('personal');
	const [search, setSearch] = useState('');
	const [results, setResults] = useState<typeof playlists>([]);
	const [selected, setSelected] = useState<Playlist[]>([]);
	const canSave = useMemo(() => selected.length > 0, [selected]);
	const segmentedOptions: { label: string, value: PlaylistSource }[] = [
		{
			label: upperFirst(t('common.messages.my_playlist', { count: 2 })),
			value: 'personal',
		},
		{
			label: upperFirst(t('common.messages.saved', { gender: 'female', count: 2 })),
			value: 'saved',
		},
	];

	// Queries
	const {
		data: playlists,
		isRefetching,
		refetch,
	} = usePlaylistMovieAddToQuery({
		userId: session?.user?.id,
		movieId: movieId,
		source: source,
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
	const handleSubmit = useCallback(async (values: AddMovieToPlaylistFormValues) => {
		if (!session) return;
		if (selected.length === 0) return;
		await addToPlaylistMutation({
			userId: session?.user.id,
			movieId: movieId,
			playlists: selected,
			comment: values.comment || undefined,
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
				router.dismiss();
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [session, selected, movieId, addToPlaylistMutation, toast, router, t]);
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
			router.back();
		}
	}, [canSave, router, t]);
	const onCreatePlaylist = useCallback((playlist: Playlist) => {
		BottomSheetPlaylistCreateRef.current?.dismiss();
		queryClient.setQueryData(playlistMovieAddToOptions({
			supabase: supabase,
			movieId: movieId,
			userId: session?.user?.id,
			source: 'personal',
		}).queryKey, (oldData) => {
			if (!oldData) return [{ playlist: playlist, already_added: false }];
			return [
				{ playlist: playlist, already_added: false },
				...oldData,
			];
		});
		setSelected((prev) => [...prev, playlist]);
	}, [queryClient, movieId, session?.user?.id, supabase]);

	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		return {
			marginBottom: withTiming(footerHeight.value, { duration: 200 }),
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
				headerRight: () => (
					<Button
					variant="outline"
					icon={Icons.Check}
					size="icon"
					onPress={form.handleSubmit(handleSubmit)}
					disabled={isAddingToPlaylist || !canSave}
					style={tw`rounded-full`}
					/>
				),
				unstable_headerLeftItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.close')),
						onPress: handleCancel,
						icon: {
							name: "xmark",
							type: "sfSymbol",
						},
					},
				],
				unstable_headerRightItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.add')),
						onPress: form.handleSubmit(handleSubmit),
						disabled: isAddingToPlaylist || !canSave,
						icon: {
							name: "checkmark",
							type: "sfSymbol",
						},
					},
				],
			}}
		/>
		<View style={[tw`gap-2`, { paddingHorizontal: PADDING, paddingVertical: PADDING_VERTICAL }]}>
			<View style={tw`flex-row items-center justify-between gap-2`}>
				<SearchBar
				autoCorrect={false}
				autoComplete="off"
				autoCapitalize="none"
				onSearch={setSearch}
				placeholder={upperFirst(t('common.messages.search_playlist', { count: 1 }))}
				containerStyle={tw`flex-1`}
				/>
				{source === 'personal' && (
                    <Animated.View 
					entering={FadeInRight.duration(200)} 
					exiting={FadeOutRight.duration(200)}
                    >
                        <Button 
						icon={Icons.Add} 
						onPress={() => BottomSheetPlaylistCreateRef.current?.present()} 
                        />
                    </Animated.View>
                )}
			</View>
			<SegmentedControl
			values={segmentedOptions.map((option) => option.label)}
			selectedIndex={segmentedOptions.findIndex((option) => option.value === source)}
			onChange={(event) => {
				setSource(segmentedOptions[event.nativeEvent.selectedSegmentIndex].value);
			}}
			/>
		</View>
		<AnimatedLegendList
		data={results?.map((item) => ({
			item: item,
			isSelected: selected.some((selectedItem) => selectedItem.id === item.playlist.id),
		})) || []}
		renderItem={({ item: { item, isSelected } }) => (
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
					<Checkbox checked={isSelected} onCheckedChange={() => handleTogglePlaylist(item.playlist)} />
				</View>
			</Pressable>
		)}
		ListEmptyComponent={
			isAddingToPlaylist ? <Icons.Loader />
			: (
				<View style={tw`p-4`}>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.no_results'))}
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
			{ paddingBottom: PADDING_VERTICAL },
		]}
		style={animatedFooterStyle}
		keyboardShouldPersistTaps='handled'
		/>
		<SelectionFooter
		data={selected}
		visibleHeight={footerHeight}
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
				placeholder={upperFirst(t('common.messages.add_comment', { count: 1 }))}
				autoCapitalize="sentences"
				value={value || ''}
				onChangeText={onChange}
				onBlur={onBlur}
				disabled={isAddingToPlaylist}
				error={form.formState.errors.comment?.message}
				/>
			)}
			/>
		</SelectionFooter>

		<BottomSheetPlaylistCreate
		ref={BottomSheetPlaylistCreateRef}
		id={`${movieId}-create-playlist`}
		onCreate={onCreatePlaylist}
		placeholder={String(movieTitle)}
		playlistType='movie'
		/>
	</>
	)
};

export default PlaylistMovieAdd;