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
import { View } from "@/components/ui/view";
import { supportedLocales } from "@/translations/locales";
import { useLocaleContext } from "@/providers/LocaleProvider";
import { Picker } from '@react-native-picker/picker';
import useLocalizedLanguageName from "@/hooks/useLocalizedLanguageName";

const SettingsAppearanceScreen = () => {
	const { locale } = useLocaleContext();
	const { bottomTabHeight } = useTheme();
	const t = useTranslations();
	const [ isLoading, setIsLoading ] = useState(false);
	const locales = useLocalizedLanguageName(locale);
	const profileFormSchema = z.object({
		locale: z.enum(supportedLocales)
	});

	type ProfileFormValues = z.infer<typeof profileFormSchema>;

	const defaultValues: Partial<ProfileFormValues> = {
		locale: locale,
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
			// 
			Burnt.toast({
				title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
				preset: 'done',
			})
			form.reset();
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof AuthError) {
				errorMessage = error.message;
			}
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: errorMessage,
				preset: 'error',
				haptic: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: upperFirst(t('pages.settings.appearance.language.label')),
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
				<Controller
				name="locale"
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`flex-row items-center gap-2`}>
					<Label>{upperFirst(t('pages.settings.appearance.language.label'))}</Label>
					<Picker
					selectedValue={value}
					onValueChange={(itemValue) => onChange(itemValue)}
					>
						{locales.map((locale, index) => (
							<Picker.Item
								key={index}
								label={upperFirst(String(locale))}
								value={locale}
								style={{ fontSize: 16 }}
							/>
						))}
					</Picker>
					{/* <Input
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
					/> */}
				</View>
				)}
				/>
			</ScrollView>
		</>
	)
};

export default SettingsAppearanceScreen;