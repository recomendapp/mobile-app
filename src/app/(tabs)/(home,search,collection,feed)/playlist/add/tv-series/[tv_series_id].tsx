import BottomSheetPlaylistCreate from "@/components/bottom-sheets/sheets/BottomSheetPlaylistCreate";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { usePlaylistTvSeriesInsertMutation } from "@/features/playlist/playlistMutations";
import { useAuth } from "@/providers/AuthProvider";
import { Playlist, PlaylistSource } from "@recomendapp/types";
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
import Animated, { FadeInRight, FadeOutRight, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SearchBar } from "@/components/ui/searchbar";
import { PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import AnimatedContentContainer from "@/components/ui/AnimatedContentContainer";
import Fuse from "fuse.js";
import { Icons } from "@/constants/Icons";
import { Badge } from "@/components/ui/Badge";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePlaylistTvSeriesAddToQuery } from "@/features/playlist/playlistQueries";
import { playlistKeys } from "@/features/playlist/playlistKeys";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COMMENT_MAX_LENGTH = 180;

const PlaylistTvSeriesAdd = () => {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const { session } = useAuth();
	const { tv_series_id, tv_series_name } = useLocalSearchParams();
	const tvSeriesId = Number(tv_series_id);
	const tvSeriesName = tv_series_name;

	// Form
	const addTvSeriesToPlaylistFormSchema = z.object({
		comment: z.string()
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/)
			.optional()
			.nullable(),
	});
	type AddTvSeriesToPlaylistFormValues = z.infer<typeof addTvSeriesToPlaylistFormSchema>;
	const defaultValues: Partial<AddTvSeriesToPlaylistFormValues> = {
		comment: '',
	};
	const form = useForm<AddTvSeriesToPlaylistFormValues>({
		resolver: zodResolver(addTvSeriesToPlaylistFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Mutations
	const addToPlaylistMutation = usePlaylistTvSeriesInsertMutation({
		tvSeriesId: tvSeriesId,
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
	const canSave = useMemo(() => {
		return selected.length > 0 && form.formState.isValid;
	}, [selected, form.formState.isValid]);
	const segmentedOptions = useMemo((): { label: string, value: PlaylistSource }[] => [
		{
			label: upperFirst(t('common.messages.my_playlist', { count: 2 })),
			value: 'personal',
		},
		{
			label: upperFirst(t('common.messages.saved', { gender: 'female', count: 2 })),
			value: 'saved',
		},
	], [t]);


	// Queries
	const {
		data: playlists,
		isRefetching,
		refetch,
	} = usePlaylistTvSeriesAddToQuery({
		userId: session?.user?.id,
		tvSeriesId: tvSeriesId,
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
	const handleSubmit = async (values: AddTvSeriesToPlaylistFormValues) => {
		if (!session) return;
		if (selected.length === 0) return;
		await addToPlaylistMutation.mutateAsync({
			userId: session?.user.id,
			tvSeriesId: tvSeriesId,
			playlists: selected,
			comment: values.comment || undefined,
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
					preset: 'done',
				});
				router.dismiss();
			},
			onError: (error) => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
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
				<Checkbox checked={isSelected} onCheckedChange={() => handleTogglePlaylist(item.playlist)} />
			</View>
        </Pressable>
		);
	}, [handleTogglePlaylist]);
	const renderScroll = useCallback((props: ScrollViewProps) => {
        return <AnimatedContentContainer {...props} />;
    }, []);

	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		const paddingBottom =  PADDING_VERTICAL + (selected.length > 0 ? footerHeight.value : insets.bottom);
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
				headerStyle: {
					backgroundColor: colors.muted,
				},
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
		renderItem={renderItems}
		ListEmptyComponent={
			addToPlaylistMutation.isPending ? <Icons.Loader />
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
			<>
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
				<Button
				variant="accent-yellow"
				onPress={form.handleSubmit(handleSubmit)}
				disabled={addToPlaylistMutation.isPending}
				>
					{upperFirst(t('common.messages.add'))}
				</Button>
			</>
			)}
			/>
		</SelectionFooter>

		<BottomSheetPlaylistCreate
		ref={BottomSheetPlaylistCreateRef}
		id={`${tvSeriesId}-create-playlist`}
		onCreate={(playlist) => {
			BottomSheetPlaylistCreateRef.current?.dismiss();
			queryClient.setQueryData(playlistKeys.addToSource({
				id: tvSeriesId,
				type: 'tv_series',
				source: 'personal',
			}), (prev: { playlist: Playlist; already_added: boolean }[] | undefined) => {
				if (!prev) return [{ playlist, already_added: false }];
				return [
					{ playlist, already_added: false },
					...prev,
				];
			});
			setSelected((prev) => [...prev, playlist]);
		}}
		placeholder={String(tvSeriesName)}
		playlistType='tv_series'
		/>
	</>
	)
};

export default PlaylistTvSeriesAdd;