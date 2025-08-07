import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/constants/Icons";
import { Stack } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Label } from "@/components/ui/Label";

const FULL_NAME_MIN_LENGTH = 1;
const FULL_NAME_MAX_LENGTH = 30;
const BIO_MAX_LENGTH = 150;

const SettingsProfileScreen = () => {
	const { user } = useAuth();
	const { colors, bottomTabHeight } = useTheme();
	const t = useTranslations();
	const updateProfileMutation = useUserUpdateMutation({
		userId: user?.id,
	});
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState(false);
	const [ isLoading, setIsLoading ] = useState(false);
	const [ newAvatar, setNewAvatar ] = useState<File>();

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
	const defaultValues = {
		full_name: user?.full_name ?? '',
		bio: user?.bio,
		website: user?.website,
	};
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Handlers
	const handleSubmit = async (values: ProfileFormValues) => {
		try {
			if (!user) return;
			setIsLoading(true);
			if (
				newAvatar 
				|| values.full_name !== user.full_name
				|| values.bio !== user.bio
				|| values.website !== user.website
			) {
				const userPayload  = {
					fullName: values.full_name,
					bio: values.bio?.trim() || null,
					website: values.website?.trim() || null,
					avatarUrl: user.avatar_url,
				};
				// if (newAvatar) {
					// 	const newAvatarUrl = ''
					// 	userPayload.avatarUrl = newAvatarUrl;
					// }
				await updateProfileMutation.mutateAsync(userPayload);
			}
			Burnt.toast({
				title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
				preset: 'done',
			})
		} catch (error: any) {
			Burnt.toast({
				title: error.message,
				preset: 'error',
				haptic: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	// useEffects
	useEffect(() => {
		if (user) {
			form.reset({
				full_name: user.full_name,
				bio: user.bio,
				website: user.website,
			});
		}
	}, [user]);
	useEffect(() => {
		const subscription = form.watch((value) => {
			const isChanged = 
				value.full_name !== defaultValues.full_name ||
				(value.bio?.trim() || null) !== defaultValues.bio ||
				(value.website?.trim() || null) !== defaultValues.website ||
				!!newAvatar;
			setHasUnsavedChanges(() => isChanged);
		});
		return () => subscription.unsubscribe();
	}, [form, defaultValues, newAvatar]);

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('pages.settings.profile.label')),
				headerRight: () => (
					<Button
					variant="ghost"
					style={tw`p-0`}
					loading={isLoading}
					onPress={form.handleSubmit(handleSubmit)}
					disabled={!hasUnsavedChanges || !form.formState.isValid}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
			}}
		/>
		<ScrollView
		contentContainerStyle={[
			tw`gap-2 p-4`,
			{ paddingBottom: bottomTabHeight + 8 }
		]}
		>
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
					<Text variant='muted' style={tw`text-xs text-justify`}>
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
					<Text variant='muted' style={tw`text-xs text-justify`}>
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
					autoCorrect={false}
					leftSectionStyle={tw`w-auto`}
					disabled={isLoading}
					error={form.formState.errors.website?.message}
					/>
					<Text variant='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.profile.url.description')}
					</Text>
				</View>
			)}
			/>
		</ScrollView>
	</>
	)
};

export default SettingsProfileScreen;