import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Input } from "@/components/ui/Input";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "react-native-gesture-handler";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";
import { ImagePickerAsset, launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync } from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { decode } from "base64-arraybuffer";
import { Separator } from "@/components/ui/separator";
import { randomUUID } from 'expo-crypto';
import { usePlaylistQuery } from "@/features/playlist/playlistQueries";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Skeleton } from "@/components/ui/Skeleton";
import Switch from "@/components/ui/Switch";
import { Alert } from "react-native";
import { usePlaylistUpdateMutation } from "@/features/playlist/playlistMutations";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useHeaderHeight } from "@react-navigation/elements";
import { LucideIcon } from "lucide-react-native";
import { Icons } from "@/constants/Icons";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

const ModalPlaylistEdit = () => {
	const supabase = useSupabaseClient();
	const { playlist_id } = useLocalSearchParams<{ playlist_id: string }>();
    const playlistId = Number(playlist_id);
	const { colors, inset } = useTheme();
	const router = useRouter();
	const { showActionSheetWithOptions } = useActionSheet();
	const t = useTranslations();
	const headerHeight = useHeaderHeight();
	const {
		data: playlist,
	} = usePlaylistQuery({
		playlistId: playlistId,
	});
	const updatePlaylistMutation = usePlaylistUpdateMutation();

	// States
	const [ isLoading, setIsLoading ] = useState(false);
	const [ newPoster, setNewPoster ] = useState<ImagePickerAsset | null | undefined>(undefined);

	// Form
	const playlistFormSchema = z.object({
		title: z.string()
			.min(TITLE_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: TITLE_MIN_LENGTH }))})
			.max(TITLE_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: TITLE_MIN_LENGTH }))}),
		description: z.string()
			.max(DESCRIPTION_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: DESCRIPTION_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/, {
				message: t('pages.playlist.form.error.format'),
			})
			.optional()
			.nullable(),
		private: z.boolean(),
	});
	type PlaylistFormValues = z.infer<typeof playlistFormSchema>;
	const defaultValues = useMemo((): Partial<PlaylistFormValues> => ({
		title: playlist?.title ?? '',
		description: playlist?.description ?? null,
		private: playlist?.private ?? false,
	}), [playlist]);
	const form = useForm<PlaylistFormValues>({
		resolver: zodResolver(playlistFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	const [ hasFormChanged, setHasFormChanged ] = useState(false);
	const canSave = useMemo(() => {
		return (hasFormChanged || newPoster !== undefined) && form.formState.isValid;
	}, [hasFormChanged, newPoster, form.formState.isValid]);

	// Routes
	const routes = useMemo((): { label: string, icon: LucideIcon, route: Href }[] => ([
		{
			label: upperFirst(t('common.messages.manage_guests', { count: 2 })),
			icon: Icons.Users,
			route: `/playlist/${playlistId}/edit/guests`,
		}
	]), [t, playlistId]);

	// Poster
	const posterOptions = useMemo(() => [
		{ label: upperFirst(t('common.messages.choose_from_the_library')), value: "library" },
		{ label: upperFirst(t('common.messages.take_a_photo')), value: "camera" },
		{ label: upperFirst(t('common.messages.delete_current_image')), value: "delete", disable: !playlist?.poster_url && !newPoster },
	], [ newPoster, t]);

	// Handlers
	const handlePosterOptions = () => {
		const options = [
			...posterOptions,
			{ label: upperFirst(t('common.messages.cancel')), value: 'cancel' },
		];
		const cancelIndex = options.length - 1;
		showActionSheetWithOptions({
			options: options.map((option) => option.label),
			disabledButtonIndices: posterOptions.map((option, index) => option.disable ? index : -1).filter((index) => index !== -1),
			cancelButtonIndex: cancelIndex,
			destructiveButtonIndex: options.findIndex(option => option.value === 'delete'),
		}, async (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			const selectedOption = options[selectedIndex];
			switch (selectedOption.value) {
				case 'library':
					const results = await launchImageLibraryAsync({
						mediaTypes: ['images'],
						allowsEditing: true,
						aspect: [1, 1],
						quality: 1,
						base64: true,
					})
					if (!results.canceled && results.assets?.length) {
						setNewPoster(results.assets[0]);
					}
					break;
				case 'camera':
					const hasPermission = await requestCameraPermissionsAsync();
					if (!hasPermission.granted) {
						Burnt.toast({
							title: upperFirst(t('common.messages.error')),
							message: upperFirst(t('common.messages.camera_permission_denied')),
							preset: 'error',
							haptic: 'error',
						});
						return;
					}
					const cameraResults = await launchCameraAsync({
						mediaTypes: ['images'],
						allowsEditing: true,
						aspect: [1, 1],
						quality: 1,
						base64: true,
					});
					if (!cameraResults.canceled && cameraResults.assets?.length) {
						setNewPoster(cameraResults.assets[0]);
					}
					break;
				case 'delete':
					setNewPoster(playlist?.poster_url ? null : undefined);
					break;
				default:
					break;
			};
		});
	};
	const handleSubmit = async (values: PlaylistFormValues) => {
		try {
			if (!playlist) return;
			setIsLoading(true);
			let poster_url: string | null | undefined;
			if (newPoster) {
				const fileExt = newPoster.uri.split('.').pop();
				const fileName = `${playlist.id}.${randomUUID()}.${fileExt}`;
				const { data, error } = await supabase.storage
					.from('playlist_posters')
					.upload(fileName, decode(newPoster.base64!), {
						contentType: newPoster.mimeType,
						upsert: true,
					});
				if (error) throw error;
				const { data: { publicUrl } } = supabase.storage
					.from('playlist_posters')
					.getPublicUrl(data.path)
				poster_url = publicUrl;
			} else if (newPoster === null) {
				poster_url = null; // Delete poster
			}
			await updatePlaylistMutation.mutateAsync({
				playlistId: playlist.id,
				title: values.title.trim(),
				description: values.description?.trim() || null,
				private: values.private,
				poster_url: poster_url,
			});
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

	// useEffects
	useEffect(() => {
		if (playlist) {
			form.reset({
				title: playlist.title,
				description: playlist.description,
				private: playlist.private,
			});
		}
	}, [playlist]);

	// Track form changes
	useEffect(() => {
		const subscription = form.watch((value) => {
			const isFormChanged =
				value.title !== defaultValues.title ||
				(value.description?.trim() || null) !== defaultValues.description ||
				(value.private !== defaultValues.private);
			setHasFormChanged(isFormChanged);
		});
		return () => subscription.unsubscribe();
	}, [form.watch, defaultValues]);

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.edit_playlist')),
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
					onPress={form.handleSubmit(handleSubmit)}
					disabled={!canSave || isLoading}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
			}}
		/>
		<KeyboardAwareScrollView
		bounces={false}
		contentContainerStyle={[
			tw`gap-2 p-4`,
		]}
		nestedScrollEnabled
		contentInset={{ bottom: inset.bottom }}
		bottomOffset={headerHeight}
		>
			<Pressable onPress={handlePosterOptions} style={tw`relative items-center justify-center gap-2`}>
				{playlist ? (
					<ImageWithFallback
					source={{uri: newPoster !== undefined ? newPoster?.uri : playlist.poster_url ?? ''}}
					alt={playlist?.title ?? ''}
					type="playlist"
					style={tw`relative aspect-square rounded-md overflow-hidden w-1/3 h-auto`}
					/>
				) : <Skeleton style={tw`aspect-square w-1/3`} color={colors.background} />}
				<Text>
					{playlist?.poster_url ? upperFirst(t('common.messages.edit_image')) : upperFirst(t('common.messages.add_image'))}
				</Text>
			</Pressable>
			<Separator />
			<Controller
			name='title'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<Label>{upperFirst(t('common.messages.name'))}</Label>
					<Input
					value={value}
					onChangeText={onChange}
					onBlur={onBlur}
					placeholder={t('pages.playlist.form.title.placeholder')}
					nativeID="title"
					autoCapitalize="sentences"
					returnKeyType="done"
					disabled={isLoading}
					leftSectionStyle={tw`w-auto`}
					error={form.formState.errors.title?.message}
					/>
				</View>
			)}
			/>
			<Controller
			name='description'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<Label>{upperFirst(t('common.messages.description'))}</Label>
					<Input
					value={value ?? ''}
					onChangeText={onChange}
					onBlur={onBlur}
					placeholder={upperFirst(t('pages.playlist.form.description.placeholder'))}
					nativeID="description"
					autoCapitalize="sentences"
					type="textarea"
					disabled={isLoading}
					error={form.formState.errors.description?.message}
					/>
				</View>
			)}
			/>
			<Controller
			name='private'
			control={form.control}
			render={({ field: { onChange, value} }) => (
				<View style={tw`flex-row items-center gap-2`}>
					<Label>{upperFirst(t('common.messages.private', { count: 1, gender: 'female' }))}</Label>
					<Switch
					value={value}
					onValueChange={onChange}
					disabled={isLoading}
					/>
				</View>
			)}
			/>
			{routes.length > 0 && (
				<>
					<Separator />
					{routes.map((item, index) => (
						<Pressable
						key={index}
						onPress={() => router.push(item.route)}
						style={[
							{ borderColor: colors.muted },
							tw`flex-1 flex-row justify-between items-center gap-2`,
							index < routes.length - 1 ? tw`border-b` : null,
						]}
						>
							<Button
							variant="ghost"
							size="fit"
							icon={item.icon}
							>
								{item.label}
							</Button>
							<Button
							variant="ghost"
							icon={Icons.ChevronRight}
							size="icon"
							/>
						</Pressable>
					))}
				</>
			)}
		</KeyboardAwareScrollView>
	</>
	)
};

export default ModalPlaylistEdit;