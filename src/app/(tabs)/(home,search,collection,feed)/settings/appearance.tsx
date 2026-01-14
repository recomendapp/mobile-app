import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { useCallback, useEffect, useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Stack } from "expo-router";
import { View } from "@/components/ui/view";
import { supportedLocales } from "@/translations/locales";
import { useLocaleContext } from "@/providers/LocaleProvider";
import { Picker } from '@react-native-picker/picker';
import useLocalizedLanguageName from "@/hooks/useLocalizedLanguageName";
import { useUserUpdateMutation } from "@/api/users/userMutations";
import { useAuth } from "@/providers/AuthProvider";
import { KeyboardAwareScrollView } from '@/components/ui/KeyboardAwareScrollView';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { KeyboardToolbar } from "@/components/ui/KeyboardToolbar";
import { useToast } from "@/components/Toast";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

const SettingsAppearanceScreen = () => {
	const { locale, setLocale } = useLocaleContext();
	const { session } = useAuth();
	const toast = useToast();
	const queryClient = useQueryClient();
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const t = useTranslations();
	const [ isLoading, setIsLoading ] = useState(false);
	const locales = useLocalizedLanguageName(locale);
	const { mutateAsync: updateUser } = useUserUpdateMutation()

	// Form
	const profileFormSchema = z.object({
		locale: z.enum(supportedLocales)
	});
	type ProfileFormValues = z.infer<typeof profileFormSchema>;
	const defaultValues: Partial<ProfileFormValues> = {
		locale: locale,
	};
	const { reset: formReset, ...form} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Handlers
	const handleSubmit = useCallback(async (data: ProfileFormValues) => {
		try {
			setIsLoading(true);
			if (session) {
				await updateUser({
					language: data.locale,
				});
			}
			setLocale(data.locale);
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
			formReset();
			queryClient.clear();
			queryClient.invalidateQueries();
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof AuthError) {
				errorMessage = error.message;
			}
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		} finally {
			setIsLoading(false);
		}
	}, [setLocale, session, updateUser, t, toast, queryClient, formReset]);

	// useEffects
	useEffect(() => {
		formReset({
			locale: locale,
		});
	}, [locale, formReset]);

	return (
		<>
			<Stack.Screen
			options={{
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
				unstable_headerRightItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.save')),
						onPress: form.handleSubmit(handleSubmit),
						tintColor: props.tintColor,
						disabled: !form.formState.isValid || isLoading,
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
				bottom: tabBarHeight,
			}}
			bottomOffset={bottomOffset + PADDING_VERTICAL}
			>
				<Controller
				name="locale"
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={{ gap: GAP }}>
					<Label>{upperFirst(t('pages.settings.appearance.language.label'))}</Label>
					<Picker
					key={`selected-${locale}`}
					selectedValue={value}
					onValueChange={(itemValue) => onChange(itemValue)}
					style={{ backgroundColor: Platform.OS === 'android' ? colors.muted : undefined}}
					dropdownIconColor={colors.foreground}
					dropdownIconRippleColor={colors.foreground}
					>
						{locales.map((locale, index) => (
							<Picker.Item
								key={index}
								label={`${locale.flag} ${locale.iso_639_1} (${locale.iso_3166_1})`}
								value={locale.language}
								style={{ fontSize: 16, backgroundColor: colors.muted }}
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