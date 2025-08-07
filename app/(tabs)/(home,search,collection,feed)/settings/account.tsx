import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import * as Burnt from 'burnt';
import { Button } from "@/components/ui/Button";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/constants/Icons";
import { useFormatter, useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Stack } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/Label";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;

const SettingsAccountScreen = () => {
	const { user, session } = useAuth();
	const format = useFormatter();
	const t = useTranslations();
	const { colors, bottomTabHeight } = useTheme();
	const updateProfileMutation = useUserUpdateMutation({
		userId: user?.id,
	});
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState(false);
	const [ isLoading, setIsLoading ] = useState(false);
	const date = new Date();
	const dateLastUsernameUpdate = user?.username_updated_at
		? new Date(user.username_updated_at)
		: new Date('01/01/1970');
	const usernameDisabled = (date.getTime() - dateLastUsernameUpdate.getTime()) / (1000 * 60 * 60 * 24) < 30 ? true : false;

	// Form
	const accountFormSchema = z.object({
		username: z
			.string()
			.min(USERNAME_MIN_LENGTH, {
				message: t('common.form.length.char_min', { count: USERNAME_MIN_LENGTH }),
			})
			.max(USERNAME_MAX_LENGTH, {
				message: t('common.form.length.char_max', { count: USERNAME_MAX_LENGTH }),
			})
			.regex(/^[^\W]/, {
				message: t('common.form.username.schema.first_char'),
			})
			.regex(/^(?!.*\.\.)/, {
				message: t('common.form.username.schema.double_dot'),
			})
			.regex(/^(?!.*\.$)/, {
				message: t('common.form.username.schema.ends_with_dot'),
			})
			.regex(/^[\w.]+$/, {
				message: t('common.form.username.schema.format'),
			}),
		private: z.boolean(),
		email: z.email({ error: t('common.form.email.error.invalid') })
	});
	type AccountFormValues = z.infer<typeof accountFormSchema>;
	const defaultValues: Partial<AccountFormValues> = {
		username: user?.username,
		private: user?.private,
		email: session?.user.email,
	};
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues,
		mode: 'onChange',
	});
	const usernameAvailability = useUsernameAvailability();
	const usernameToCheck = useDebounce(form.watch('username'), 500);

	// Handlers
	const onSubmit = async (values: AccountFormValues) => {
		try {
			if (!user) return;
			setIsLoading(true);
			if (
				values.username !== user.username
				|| values.private !== user.private
			) {
				await updateProfileMutation.mutateAsync({
					username: values.username,
					privateAccount: values.private,
				});
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
		if (!form.formState.errors.username?.message && usernameToCheck && usernameToCheck !== user?.username) {
			usernameAvailability.check(usernameToCheck);
		}
	}, [usernameToCheck]);
	useEffect(() => {
		if (usernameAvailability.isAvailable === false) {
			form.setError('username', {
				message: t('common.form.username.schema.unavailable'),
			});
		}
	}, [usernameAvailability.isAvailable, t]);
	useEffect(() => {
		if (user || session) {
			form.reset({
				username: user?.username,
				private: user?.private,
				email: session?.user.email
			});
		}
	}, [user, session]);

	useEffect(() => {
		const subscription = form.watch((value) => {
			const isChanged = 
				value.username !== defaultValues.username ||
				value.private !== defaultValues.private ||
				value.email !== defaultValues.email;
			setHasUnsavedChanges(() => isChanged);
		});
		return () => subscription.unsubscribe();
	}, [form, defaultValues]);

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: upperFirst(t('pages.settings.account.label')),
					headerRight: () => (
						<Button
						variant="ghost"
						style={tw`p-0`}
						loading={isLoading}
						onPress={form.handleSubmit(onSubmit)}
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
				{/* <Text variant="muted" style={tw`text-sm text-justify`}>{t(`pages.settings.account.description`)}</Text> */}
				<Controller
				name='username'
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.account.username.label')}</Label>
					<Input
					icon={Icons.User}
					disabled={usernameDisabled}
					autoComplete="username"
					autoCapitalize='none'
					placeholder={t('pages.settings.account.username.placeholder')}
					value={value}
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					leftSectionStyle={tw`w-auto`}
					rightComponent={(!form.formState.errors.username && hasUnsavedChanges && !usernameDisabled) ? (
						usernameAvailability.isLoading ? <Icons.Loader />
						: (
							<View style={[{ backgroundColor: usernameAvailability.isAvailable ? colors.success : colors.destructive }, tw`rounded-full h-6 w-6 items-center justify-center`]}>
								{usernameAvailability.isAvailable ? (
									<Icons.Check size={17} color={colors.successForeground} />
								) : <Icons.Cancel size={17} color={colors.destructiveForeground} />}
							</View>
						)
					) : undefined}
					error={form.formState.errors.username?.message}
					/>
					{usernameDisabled && (
						<Text style={[{ color: colors.destructive }, tw`text-right`]}>
							{upperFirst(t('common.messages.last_updated_at_date', {
								date: format.dateTime(dateLastUsernameUpdate, { dateStyle: 'long', timeStyle: 'short' })
							}))}
						</Text>
					)}
					<Text variant='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.account.username.description')}
					</Text>
				</View>
				)}
				/>
			</ScrollView>
		</>
	)
};

export default SettingsAccountScreen;