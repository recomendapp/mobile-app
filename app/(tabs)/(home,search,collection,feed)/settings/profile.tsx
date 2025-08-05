import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/InputOld";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";

const ProfileSettings = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { colors, inset } = useTheme();
	const updateProfileMutation = useUserUpdateMutation({
		userId: user?.id,
	});
	const [ isLoading, setIsLoading ] = useState(false);
	const [ newAvatar, setNewAvatar ] = useState<File>();
	const profileFormSchema = z.object({
		full_name: z
		  .string()
		  .min(1, {
			message: t('pages.settings.profile.full_name.form.min_length'),
		  })
		  .max(50, {
			message: t('pages.settings.profile.full_name.form.max_length'),
		  })
		  .regex(/^(?!\s+$)[a-zA-Z0-9\s\S]*$/),
		bio: z
		  .string()
		  .max(150, {
			message: t('pages.settings.profile.bio.form.max_length'),
		  })
		  .optional()
		  .nullable(),
		website: z
		  .string()
		  .url({
			message: t('pages.settings.profile.url.form.invalid'),
		  })
		  .or(z.literal(''))
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
	const onSubmit = async (values: ProfileFormValues) => {
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
					bio: values.bio?.trim() ?? null,
					website: values.website?.trim() ?? null,
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
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			form.reset({
				full_name: user.full_name,
				bio: user.bio,
				website: user.website,
			});
		}
	}, [user]);

	return (
		<>
			<Controller
			name='full_name'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={tw`gap-2`}>
					<View style={tw`flex-row items-center justify-between`}>
						<Label>{t('pages.settings.profile.full_name.label')}</Label>
						<ThemedText>{value?.length ?? 0} / 50</ThemedText>
					</View>
					<Input
					placeholder={t('pages.settings.profile.full_name.placeholder')}
					value={value}
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					/>
					<Text style={[{ color: colors.mutedForeground }, tw`text-sm text-justify`]}>
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
					<View style={tw`flex-row items-center justify-between`}>
						<Label>{t('pages.settings.profile.bio.label')}</Label>
						<ThemedText>{value?.length ?? 0} / 150</ThemedText>
					</View>
					<Input
					placeholder={t('pages.settings.profile.bio.placeholder')}
					style={tw`h-24`}
					multiline
					value={value ?? ''}
					onBlur={onBlur}
					onChangeText={onChange}
					/>
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
					placeholder={'https://example.com'}
					value={value ?? ''}
					autoCapitalize='none'
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					/>
				</View>
			)}
			/>
			<Button
			loading={updateProfileMutation.isPending}
			onPress={form.handleSubmit(onSubmit)}
			disabled={isLoading}
			>
				{t('common.messages.save')}
			</Button>
		</>
	)
};

export default ProfileSettings;