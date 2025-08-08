import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import * as Burnt from 'burnt';
import tw from "@/lib/tw";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Input } from "@/components/ui/Input";
import { ScrollView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const SettingsSecurityScreen = () => {
	const supabase = useSupabaseClient();
	const { colors, bottomTabHeight } = useTheme();
	const t = useTranslations();
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

	// Handlers
	const handleSubmit = async (data: ProfileFormValues) => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.updateUser({
				password: data.newpassword,
			});
			if (error) throw error;
			Burnt.toast({
				title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
				preset: 'done',
			})
			form.reset();
		} catch (error) {
			if (error instanceof AuthError) {
				Burnt.toast({
					title: t('common.messages.error'),
					message: error.message,
					preset: 'error',
					haptic: 'error',
				});
			} else {
				Burnt.toast({
					title: t('common.messages.error'),
					preset: 'error',
					haptic: 'error',
				})
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: upperFirst(t('pages.settings.security.label')),
					headerRight: () => (
						<Button
						variant="ghost"
						style={tw`p-0`}
						loading={isLoading}
						onPress={form.handleSubmit(handleSubmit)}
						disabled={!form.formState.isValid}
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
				<Text textColor='muted' style={tw`text-sm text-justify`}>{t(`pages.settings.security.description`)}</Text>
				<Controller
				name="newpassword"
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{upperFirst(t('common.form.password.label'))}</Label>
					<Input
					label={null}
					placeholder={t('pages.settings.security.new_password.placeholder')}
					value={value ?? ''}
					onChangeText={onChange}
					onBlur={onBlur}
					nativeID="newpassword"
					autoComplete="new-password"
					autoCapitalize="none"
					disabled={isLoading}
					leftSectionStyle={tw`w-auto`}
					error={form.formState.errors.newpassword?.message}
					type="password"
					/>
				</View>
				)}
				/>
				<Controller
				name="confirmnewpassword"
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{upperFirst(t('common.form.password.confirm.label'))}</Label>
					<Input
					label={null}
					placeholder={t('pages.settings.security.confirm_password.placeholder')}
					value={value ?? ''}
					onChangeText={onChange}
					onBlur={onBlur}
					nativeID="confirmnewpassword"
					autoComplete="new-password"
					autoCapitalize="none"
					disabled={isLoading}
					leftSectionStyle={tw`w-auto`}
					error={form.formState.errors.confirmnewpassword?.message}
					type="password"
					/>
				</View>
				)}
				/>
			</ScrollView>
		</>
	)
};

export default SettingsSecurityScreen;