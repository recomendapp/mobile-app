import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Stack } from "expo-router";
import { View } from "@/components/ui/view";
import { supportedLocales } from "@/translations/locales";
import { useLocaleContext } from "@/providers/LocaleProvider";
import { Picker } from '@react-native-picker/picker';
import useLocalizedLanguageName from "@/hooks/useLocalizedLanguageName";
import { useUserUpdateMutation } from "@/features/user/userMutations";
import { useAuth } from "@/providers/AuthProvider";
import { KeyboardAwareScrollView } from '@/components/ui/KeyboardAwareScrollView';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { KeyboardToolbar } from "@/components/ui/KeyboardToolbar";
import { useToast } from "@/components/Toast";

const SettingsAppearanceScreen = () => {
	const { locale, setLocale } = useLocaleContext();
	const { session } = useAuth();
	const toast = useToast();
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const t = useTranslations();
	const [ isLoading, setIsLoading ] = useState(false);
	const locales = useLocalizedLanguageName(locale);
	const updateUser = useUserUpdateMutation({
		userId: session?.user.id
	})

	// Form
	const profileFormSchema = useMemo(() => z.object({
		locale: z.enum(supportedLocales)
	}), [supportedLocales]);
	type ProfileFormValues = z.infer<typeof profileFormSchema>;
	const defaultValues = useMemo((): Partial<ProfileFormValues> => ({
		locale: locale,
	}), [locale]);
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Handlers
	const handleSubmit = useCallback(async (data: ProfileFormValues) => {
		try {
			setIsLoading(true);
			if (session) {
				await updateUser.mutateAsync({
					language: data.locale,
				});
			}
			setLocale(data.locale);
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
			form.reset();
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof AuthError) {
				errorMessage = error.message;
			}
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		} finally {
			setIsLoading(false);
		}
	}, [session, t, setLocale, updateUser, form]);

	// useEffects
	useEffect(() => {
		form.reset({
			locale: locale,
		});
	}, [locale]);

	return (
		<>
			<Stack.Screen
				options={useMemo(() => ({
					headerTitle: upperFirst(t('pages.settings.appearance.label')),
					headerRight: () => (
						<Button
						variant="ghost"
						size="fit"
						loading={isLoading}
						onPress={form.handleSubmit(handleSubmit)}
						disabled={!form.formState.isValid || isLoading}
						>
							{upperFirst(t('common.messages.save'))}
						</Button>
					),
				}), [t, isLoading, form, handleSubmit])}
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
				<Controller
				name="locale"
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View>
					<Label>{upperFirst(t('pages.settings.appearance.language.label'))}</Label>
					<Picker
					selectedValue={value}
					onValueChange={(itemValue) => onChange(itemValue)}
					>
						{locales.map((locale, index) => (
							<Picker.Item
								key={index}
								label={`${locale.flag} ${locale.iso_639_1} (${locale.iso_3166_1})`}
								value={locale.language}
								style={{ fontSize: 16 }}
								color={colors.foreground}
							/>
						))}
					</Picker>
				</View>
				)}
				/>
			</KeyboardAwareScrollView>
			<KeyboardToolbar />
		</>
	)
};

export default SettingsAppearanceScreen;