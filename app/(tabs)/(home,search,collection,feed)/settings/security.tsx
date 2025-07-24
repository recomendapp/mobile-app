import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { ActivityIndicator, Text, View } from "react-native";
import tw from "@/lib/tw";
import { Label } from "@/components/ui/Label";
import { InputPassword } from "@/components/ui/InputPasswordOld";
import { Button, ButtonText } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";

const SecuritySettings = () => {
	const supabase = useSupabaseClient();
	const { colors } = useTheme();
	const { t } = useTranslation();
	const [ isLoading, setIsLoading ] = useState(false);
	const profileFormSchema = z.object({
		newpassword: z
		.string()
		.min(8, {
			message: t('pages.settings.security.new_password.form.min_length'),
		})
		.regex(/[A-Z]/, {
			message: t('pages.settings.security.new_password.form.uppercase'),
		})
		.regex(/[a-z]/, {
			message: t('pages.settings.security.new_password.form.lowercase'),
		})
		.regex(/[0-9]/, {
			message: t('pages.settings.security.new_password.form.number'),
		})
		.regex(/[\W_]/, {
			message: t('pages.settings.security.new_password.form.special'),
		}),
		confirmnewpassword: z.string(),
	}).refine((data) => data.newpassword === data.confirmnewpassword, {
		message: t('pages.settings.security.confirm_password.form.match'),
		path: ['confirmnewpassword'],
	});

	type ProfileFormValues = z.infer<typeof profileFormSchema>;

	const defaultValues: Partial<ProfileFormValues> = {
		newpassword: '',
		confirmnewpassword: '',
	};

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	const onSubmit = async (data: ProfileFormValues) => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.updateUser({
				password: data.newpassword,
			});
			if (error) throw error;
			Burnt.toast({
				title: t('common.word.saved'),
				preset: 'done',
			})
			form.reset();
		} catch (error) {
			if (error instanceof AuthError) {
				Burnt.toast({
					title: t('common.messages.error'),
					message: error.message,
					preset: 'error',
				});
			} else {
				Burnt.toast({
					title: t('common.messages.error'),
					preset: 'error',
				})
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Controller
			name="newpassword"
			control={form.control}
			render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.security.new_password.label')}</Label>
					<InputPassword
					nativeID="newpassword"
					placeholder={t('pages.settings.security.new_password.placeholder')}
					value={value ?? ''}
					autoComplete="new-password"
					autoCapitalize="none"
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					/>
					{form.formState.errors.newpassword && (
						<Text style={{ color: colors.destructive }}>
						{form.formState.errors.newpassword.message}
						</Text>
					)}
				</View>
			)}
			/>
			<Controller
			name="confirmnewpassword"
			control={form.control}
			render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.security.confirm_password.label')}</Label>
					<InputPassword
					nativeID="confirmnewpassword"
					placeholder={t('pages.settings.security.confirm_password.placeholder')}
					value={value ?? ''}
					autoCapitalize="none"
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					/>
					{form.formState.errors.confirmnewpassword && (
						<Text style={{ color: colors.destructive }}>
						{form.formState.errors.confirmnewpassword.message}
						</Text>
					)}
				</View>
			)}
			/>
			<Button
			onPress={form.handleSubmit(onSubmit)}
			disabled={isLoading}
			>
				{isLoading ? <ActivityIndicator color={colors.background} /> : null}
				<ButtonText>{t('common.word.save')}</ButtonText>
			</Button>
		</>
	)
};

export default SecuritySettings;