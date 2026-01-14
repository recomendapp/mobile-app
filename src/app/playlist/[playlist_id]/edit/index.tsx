import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Input } from "@/components/ui/Input";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";
import { ImagePickerAsset, launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync } from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import { Skeleton } from "@/components/ui/Skeleton";
import Switch from "@/components/ui/Switch";
import { Alert, Pressable } from "react-native";
import { usePlaylistUpdateMutation } from "@/api/playlists/playlistMutations";
import { KeyboardAwareScrollView } from '@/components/ui/KeyboardAwareScrollView';
import { useHeaderHeight } from "@react-navigation/elements";
import { LucideIcon } from "lucide-react-native";
import { Icons } from "@/constants/Icons";
import { KeyboardToolbar } from "@/components/ui/KeyboardToolbar";
import { useToast } from "@/components/Toast";
import { PADDING_VERTICAL } from "@/theme/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlaylistDetailsQuery } from "@/api/playlists/playlistQueries";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

const ModalPlaylistEdit = () => {
	const { playlist_id } = useLocalSearchParams<{ playlist_id: string }>();
    const playlistId = Number(playlist_id);
	const toast = useToast();
	const insets = useSafeAreaInsets();
	const { colors, mode } = useTheme();
	const router = useRouter();
	const { showActionSheetWithOptions } = useActionSheet();
	const t = useTranslations();
	const headerHeight = useHeaderHeight();
	const {
		data: playlist,
	} = usePlaylistDetailsQuery({
		playlistId: playlistId,
	});
	const { mutateAsync: updatePlaylistMutation} = usePlaylistUpdateMutation();

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
	const { watch: formWatch, reset: formReset, ...form} = useForm<PlaylistFormValues>({
		resolver: zodResolver(playlistFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	const [ hasFormChanged, setHasFormChanged ] = useState(false);
	const canSave = useMemo(() => {
		return hasFormChanged || newPoster !== undefined;
	}, [hasFormChanged, newPoster]);

	// Routes
	const routes: { label: string, icon: LucideIcon, route: Href }[] = [
		{
			label: upperFirst(t('common.messages.manage_guests', { count: 2 })),
			icon: Icons.Users,
			route: `/playlist/${playlistId}/edit/guests`,
		}
	];

	// Poster
	const posterOptions = useMemo((): { label: string, value: "library" | "camera" | "delete", disable?: boolean }[] => ([
		{ label: upperFirst(t('common.messages.choose_from_the_library')), value: "library" },
		{ label: upperFirst(t('common.messages.take_a_photo')), value: "camera" },
		{ label: upperFirst(t('common.messages.delete_current_image')), value: "delete", disable: !playlist?.poster_url && !newPoster },
	]), [playlist?.poster_url, newPoster, t]);
	// Handlers
	const handlePosterOptions = useCallback(() => {
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
						toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.camera_permission_denied')) });
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
	}, [playlist, showActionSheetWithOptions, toast, t, posterOptions]);

	const handleSubmit = useCallback(async (values: PlaylistFormValues) => {
		try {
			if (!playlist) return;
			setIsLoading(true);
			await updatePlaylistMutation({
				id: playlist.id,
				title: values.title.trim(),
				description: values.description?.trim() || null,
				private: values.private,
				poster: newPoster,
			});
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
			router.dismiss();
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (typeof error === 'string') {
				errorMessage = error;
			}
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		} finally {
			setIsLoading(false);
		}
	}, [playlist, newPoster, updatePlaylistMutation, toast, router, t]);

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

	// useEffects
	useEffect(() => {
		if (playlist) {
			formReset({
				title: playlist.title,
				description: playlist.description,
				private: playlist.private,
			});
		}
	}, [playlist, formReset]);

	// Track form changes
	useEffect(() => {
		const subscription = formWatch((value) => {
			const isFormChanged =
				value.title !== defaultValues.title ||
				(value.description?.trim() || null) !== defaultValues.description ||
				(value.private !== defaultValues.private) ||
				newPoster !== undefined;
			setHasFormChanged(isFormChanged);
		});
		return () => subscription.unsubscribe();
	}, [formWatch, defaultValues, newPoster]);

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.edit_playlist')),
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
					onPress={form.handleSubmit(handleSubmit)}
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
						disabled: isLoading,
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
						onPress: form.handleSubmit(handleSubmit),
						tintColor: props.tintColor,
						disabled: !canSave || isLoading,
						icon: {
							name: "checkmark",
							type: "sfSymbol",
						},
					},
				],
			}}
		/>
		<KeyboardAwareScrollView
		bounces={false}
		contentContainerStyle={[
			tw`gap-2 p-4`,
			{ paddingBottom: insets.bottom + PADDING_VERTICAL }
		]}
		nestedScrollEnabled
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
		<KeyboardToolbar />
	</>
	)
};

export default ModalPlaylistEdit;