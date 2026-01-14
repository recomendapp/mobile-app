import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserUpdateMutation } from "@/api/users/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/constants/Icons";
import { Stack } from "expo-router";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";
import { ImagePickerAsset, launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync } from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import UserAvatar from "@/components/user/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { KeyboardToolbar } from "@/components/ui/KeyboardToolbar";
import { useToast } from "@/components/Toast";
import { Pressable } from "react-native";
import { KeyboardAwareScrollView } from "@/components/ui/KeyboardAwareScrollView";

const FULL_NAME_MIN_LENGTH = 1;
const FULL_NAME_MAX_LENGTH = 30;
const BIO_MAX_LENGTH = 150;

const SettingsProfileScreen = () => {
	const { user } = useAuth();
	const toast = useToast();
	const { bottomOffset, tabBarHeight } = useTheme();
	const t = useTranslations();
	const { showActionSheetWithOptions } = useActionSheet();
	const { mutateAsync: updateProfileMutation } = useUserUpdateMutation();
	const [ isLoading, setIsLoading ] = useState(false);
	const [ newAvatar, setNewAvatar ] = useState<ImagePickerAsset | null | undefined>(undefined);
	// Form
	const profileFormSchema = z.object({
		full_name: z
		  .string()
		  .min(FULL_NAME_MIN_LENGTH, {
			message: t('common.form.length.char_min', { count: FULL_NAME_MIN_LENGTH }),
		  })
		  .max(FULL_NAME_MAX_LENGTH, {
			message: t('common.form.length.char_max', { count: FULL_NAME_MAX_LENGTH }),
		  })
		  .regex(/^(?!\s+$)[\s\S]*$/),
		bio: z
		  .string()
		  .max(BIO_MAX_LENGTH, {
			message: t('common.form.length.char_max', { count: BIO_MAX_LENGTH }),
		  })
		  .regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/, {
			message: t('pages.settings.profile.bio.form.format'),
		  })
		  .optional()
		  .nullable(),
		website: z
		  .url({
			  message: t('pages.settings.profile.url.form.invalid'),
		  })
		  .optional()
		  .nullable(),
	});
	type ProfileFormValues = z.infer<typeof profileFormSchema>;
	const defaultValues: Partial<ProfileFormValues> = {
		full_name: user?.full_name ?? '',
		bio: user?.bio,
		website: user?.website,
	};
	const { watch: formWatch, reset: formReset, ...form} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	const [ hasFormChanged, setHasFormChanged ] = useState(false);
	const canSave = useMemo(() => hasFormChanged || newAvatar !== undefined, [hasFormChanged, newAvatar]);

	// Avatar
	const avatarOptions = useMemo(() => [
		{ label: upperFirst(t('common.messages.choose_from_the_library')), value: "library" },
		{ label: upperFirst(t('common.messages.take_a_photo')), value: "camera" },
		{ label: upperFirst(t('common.messages.delete_current_image')), value: "delete", disable: !user?.avatar_url && !newAvatar },
	], [t, user?.avatar_url, newAvatar]);

	const handleAvatarOptions = useCallback(() => {
		const options = [
			...avatarOptions,
			{ label: upperFirst(t('common.messages.cancel')), value: 'cancel' },
		];
		const cancelIndex = options.length - 1;
		showActionSheetWithOptions({
			options: options.map((option) => option.label),
			disabledButtonIndices: avatarOptions.map((option, index) => option.disable ? index : -1).filter((index) => index !== -1),
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
						setNewAvatar(results.assets[0]);
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
						setNewAvatar(cameraResults.assets[0]);
					}
					break;
				case 'delete':
					setNewAvatar(user?.avatar_url ? null : undefined);
					break;
				default:
					break;
			};
		});
	}, [showActionSheetWithOptions, toast, t, user?.avatar_url, avatarOptions]);

	const handleSubmit = useCallback(async (values: ProfileFormValues) => {
		try {
			if (!user) return;
			setIsLoading(true);
			await updateProfileMutation({
				full_name: values.full_name,
				bio: values.bio?.trim() || null,
				website: values.website?.trim() || null,
				avatar: newAvatar,
			});
			setNewAvatar(undefined);
			setHasFormChanged(false);
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
		} catch (error) {
			console.error(error);
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
	}, [user, newAvatar, updateProfileMutation, toast, t]);

	// useEffects
	useEffect(() => {
		if (user) {
			formReset({
				full_name: user.full_name,
				bio: user.bio,
				website: user.website,
			});
		}
	}, [user, formReset]);
	// Track form changes
	useEffect(() => {
		const subscription = formWatch((value) => {
			const isFormChanged =
				value.full_name !== defaultValues.full_name ||
				(value.bio?.trim() || null) !== defaultValues.bio ||
				(value.website?.trim() || null) !== defaultValues.website;
			setHasFormChanged(isFormChanged);
		});
		return () => subscription.unsubscribe();
	}, [formWatch, defaultValues.full_name, defaultValues.bio, defaultValues.website]);

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('pages.settings.profile.label')),
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
		contentContainerStyle={{
			gap: GAP,
			paddingTop: PADDING_VERTICAL,
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight
		}}
		bottomOffset={bottomOffset + PADDING_VERTICAL}
		>
			<Pressable onPress={handleAvatarOptions} style={tw`items-center justify-center gap-2`}>
				{user ? (
					<UserAvatar
					avatar_url={newAvatar !== undefined ? newAvatar?.uri : user?.avatar_url}
					full_name={user?.full_name} style={tw`w-24 h-24`}
					/>
				) : <UserAvatar skeleton style={tw`w-24 h-24`} />}
				<Text>
					{user?.avatar_url ? upperFirst(t('common.messages.edit_image')) : upperFirst(t('common.messages.add_image'))}
				</Text>
			</Pressable>
			<Separator />
			<Controller
			name='full_name'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.profile.full_name.label')}</Label>
					<Input
					value={value}
					onChangeText={onChange}
					onBlur={onBlur}
					placeholder={t('pages.settings.profile.full_name.placeholder')}
					icon={Icons.User}
					nativeID="full_name"
					autoComplete="name"
					autoCapitalize="words"
					disabled={isLoading}
					leftSectionStyle={tw`w-auto`}
					error={form.formState.errors.full_name?.message}
					/>
					<Text textColor='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.profile.full_name.description')}
					</Text>
				</View>
			)}
			/>
			<Controller
			name='bio'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.profile.bio.label')}</Label>
					<Input
					value={value ?? ''}
					onChangeText={onChange}
					onBlur={onBlur}
					placeholder={t('pages.settings.profile.bio.placeholder')}
					nativeID="bio"
					autoCapitalize="sentences"
					type="textarea"
					disabled={isLoading}
					error={form.formState.errors.bio?.message}
					/>
					<Text textColor='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.profile.bio.description')}
					</Text>
				</View>
			)}
			/>
			<Controller
			name='website'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.profile.url.label')}</Label>
					<Input
					value={value ?? ''}
					onChangeText={onChange}
					onBlur={onBlur}
					placeholder="https://example.com"
					icon={Icons.link}
					nativeID="website"
					autoCapitalize="none"
					keyboardType="url"
					autoCorrect={false}
					leftSectionStyle={tw`w-auto`}
					disabled={isLoading}
					error={form.formState.errors.website?.message}
					/>
					<Text textColor='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.profile.url.description')}
					</Text>
				</View>
			)}
			/>
		</KeyboardAwareScrollView>
		<KeyboardToolbar />
	</>
	)
};

export default SettingsProfileScreen;