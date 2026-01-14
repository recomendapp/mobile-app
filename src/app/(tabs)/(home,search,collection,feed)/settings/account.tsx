import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserDeleteRequestDeleteMutation, useUserDeleteRequestInsertMutation, useUserUpdateMutation } from "@/api/users/userMutations";
import tw from "@/lib/tw";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from 'zod';
import { Button } from "@/components/ui/Button";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/constants/Icons";
import { useFormatter, useNow, useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Stack } from "expo-router";
import { ActivityIndicator, Alert, Text as RNText } from "react-native";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/Label";
import Switch from "@/components/ui/Switch";
import { GridView } from "@/components/ui/GridView";
import richTextToPlainString from "@/utils/richTextToPlainString";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Separator } from "@/components/ui/separator";
import { KeyboardAwareScrollView } from '@/components/ui/KeyboardAwareScrollView';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { KeyboardToolbar } from "@/components/ui/KeyboardToolbar";
import { useToast } from "@/components/Toast";
import { useUserDeleteRequestQuery } from "@/api/users/userQueries";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;

const SettingsAccountScreen = () => {
	const { user, session, updateEmail, cancelPendingEmailChange, verifyEmailChange } = useAuth();
	const format = useFormatter();
	const t = useTranslations();
	const toast = useToast();
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const { mutateAsync: updateProfileMutation} = useUserUpdateMutation();
	const { showActionSheetWithOptions } = useActionSheet();
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState(false);
	const [ isLoading, setIsLoading ] = useState(false);

	const now = useNow();
	const dateLastUsernameUpdate = user?.username_updated_at ? new Date(user.username_updated_at) : new Date('01/01/1970');
	const usernameDisabled = (now.getTime() - dateLastUsernameUpdate.getTime()) / (1000 * 60 * 60 * 24) < 30 ? true : false;

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
	const { reset: fromReset, setError: formSetError, ...form} = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues,
		mode: 'onChange',
	});
	const usernameAvailability = useUsernameAvailability();
	const usernameToCheck = useDebounce(form.watch('username'), 500);

	// Handlers
	const handleVerifyEmail = useCallback(async (email: string, token: string) => {
		try {
			setIsLoading(true);
			await verifyEmailChange(email, token);
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
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
	}, [verifyEmailChange, toast, t]);
	const handleOnSubmit = useCallback(async (values: AccountFormValues) => {
		try {
			if (!user) return;
			setIsLoading(true);
			if (
				values.username !== user.username
				|| values.private !== user.private
			) {
				await updateProfileMutation({
					username: values.username,
					private: values.private,
				});
			}
			if (values.email && values.email !== session?.user.email) {
				await updateEmail(values.email);
			}
			setHasUnsavedChanges(false);
			toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
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
	}, [user, session, updateProfileMutation, updateEmail, toast, t]);
	const handleCancelEmailChange = useCallback(async () => {
		try {
			setIsLoading(true);
			await cancelPendingEmailChange();
			toast.success(upperFirst(t('common.messages.request_canceled')));
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
	}, [cancelPendingEmailChange, toast, t]);
	const handleVerifyEmailButtonPress = useCallback(() => {
		const options = [
			...(session?.user.email ? [{label: session?.user.email, value: session?.user.email}] : []),
			...(session?.user.new_email ? [{label: session?.user.new_email, value: session?.user.new_email}] : []),
			{ label: upperFirst(t('common.messages.cancel')), value: 'cancel' }
		]
		if (options.length === 1) return;
		const cancelIndex = options.length - 1;
		showActionSheetWithOptions({
			options: options.map(option => option.label),
			disabledButtonIndices: [],
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			const selectedOption = options[selectedIndex];
			if (selectedOption) {
				Alert.prompt(
					upperFirst(t('common.messages.verify_with_a_code')),
					richTextToPlainString(t.rich('pages.settings.account.email.confirm_email_code.description', {
						email: selectedOption.value || upperFirst(t('common.messages.unknown')),
						strong: (chunk) => `"${chunk}"`,
					})),
					[
						{
							text: upperFirst(t('common.messages.cancel')),
							style: 'cancel',
						},
						{
							text: upperFirst(t('common.messages.ok')),
							onPress: (text?: string) => {
								if (text) {
									handleVerifyEmail(selectedOption.value, text);
								}
							},
						},
					],
					'plain-text',
					undefined,
					'numeric',
				);
			}
		})
	}, [session, showActionSheetWithOptions, t, handleVerifyEmail]);

	// useEffects
	useEffect(() => {
		if (!form.formState.errors.username?.message && usernameToCheck && usernameToCheck !== user?.username) {
			usernameAvailability.check(usernameToCheck);
		}
	}, [usernameToCheck]);
	useEffect(() => {
		if (usernameAvailability.isAvailable === false) {
			formSetError('username', {
				message: t('common.form.username.schema.unavailable'),
			});
		}
	}, [usernameAvailability.isAvailable, t, formSetError]);
	useEffect(() => {
		if (user || session) {
			fromReset({
				username: user?.username,
				private: user?.private,
				email: session?.user.email
			});
		}
	}, [user, session, fromReset]);

	useEffect(() => {
		const subscription = form.watch((value) => {
			const isChanged = 
				value.username !== defaultValues.username ||
				value.private !== defaultValues.private ||
				value.email !== defaultValues.email;
			setHasUnsavedChanges(() => isChanged);
		});
		return () => subscription.unsubscribe();
	}, [form, defaultValues.email, defaultValues.private, defaultValues.username]);

	return (
		<>
			<Stack.Screen
			options={{
				headerTitle: upperFirst(t('pages.settings.account.label')),
				headerRight: () => (
					<Button
					variant="ghost"
					size="fit"
					loading={isLoading}
					onPress={form.handleSubmit(handleOnSubmit)}
					disabled={!hasUnsavedChanges || !form.formState.isValid || isLoading}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
				unstable_headerRightItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.save')),
						onPress: form.handleSubmit(handleOnSubmit),
						tintColor: props.tintColor,
						disabled: !hasUnsavedChanges || !form.formState.isValid || isLoading,
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
				<Controller
				name='username'
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{t('pages.settings.account.username.label')}</Label>
					<Input
					icon={Icons.User}
					disabled={usernameDisabled || isLoading}
					autoComplete="username"
					autoCapitalize='none'
					placeholder={t('pages.settings.account.username.placeholder')}
					value={value}
					autoCorrect={false}
					onBlur={onBlur}
					onChangeText={onChange}
					leftSectionStyle={tw`w-auto`}
					rightComponent={(!form.formState.errors.username && value !== defaultValues.username) ? (
						usernameAvailability.isLoading ? <ActivityIndicator />
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
						<Text style={[{ color: colors.destructive }, tw`text-right text-xs`]}>
							{upperFirst(t('common.messages.last_updated_at_date', {
								date: format.dateTime(dateLastUsernameUpdate, { dateStyle: 'long', timeStyle: 'short' })
							}))}
						</Text>
					)}
					<Text textColor='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.account.username.description')}
					</Text>
				</View>
				)}
				/>
				<Controller
				name='private'
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<View style={tw`flex-row items-center justify-between gap-2`}>
						<Label>{t('pages.settings.account.private.label')}</Label>
						<Switch
						value={value}
						onValueChange={onChange}
						/>
					</View>
					<Text textColor='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.account.private.description')}
					</Text>
				</View>
				)}
				/>
				<Controller
				name='email'
				control={form.control}
				render={({ field: { onChange, onBlur, value } }) => (
				<View style={tw`gap-2`}>
					<Label>{t('common.form.email.label')}</Label>
					<Input
					icon={Icons.Mail}
					autoComplete="email"
					autoCapitalize='none'
					placeholder={t('common.form.email.placeholder')}
					value={value}
					onBlur={onBlur}
					onChangeText={onChange}
					leftSectionStyle={tw`w-auto`}
					error={form.formState.errors.email?.message}
					disabled={!!session?.user.new_email || isLoading}
					/>
					{session?.user.new_email && (
					<>
						<Text style={[{ color: colors.destructive }, tw`text-center text-xs`]}>
							{t.rich('pages.settings.account.email.change_pending', {
								strong: (chunks) => <RNText style={tw`font-semibold`}>{chunks}</RNText>,
								date: session.user.email_change_sent_at ? format.dateTime(new Date(session.user.email_change_sent_at), { dateStyle: 'long', timeStyle: 'short' }) : upperFirst(t('common.messages.unknown')),
								email: session.user.new_email
							})}
						</Text>
						<GridView
						data={[
							{
								label: upperFirst(t('common.messages.verify_with_a_code')),
								variant: 'outline' as const,
								textColor: colors.accentYellow,
								onPress: handleVerifyEmailButtonPress,
							},
							{
								label: upperFirst(t('common.messages.cancel_request')),
								variant: 'outline' as const,
								textColor: colors.destructive,
								onPress: handleCancelEmailChange,
							}
						]}
						renderItem={(item) => (
							<Button variant={item.variant} size="sm" onPress={item.onPress} textStyle={[tw`text-center`, item.textColor ? { color: item.textColor } : {}]} disabled={isLoading}>
								{item.label}
							</Button>
						)}
						gap={50}
						/>
					</>
					)}
					<Text textColor='muted' style={tw`text-xs text-justify`}>
						{t('pages.settings.account.email.description')}
					</Text>
				</View>
				)}
				/>
				<Separator style={tw`my-4`} />
				<DeleteAccountSection />
			</KeyboardAwareScrollView>
			<KeyboardToolbar />
		</>
	)
};

const DeleteAccountSection = () => {
	const { user } = useAuth();
	const { colors, mode } = useTheme();
	const toast = useToast();
	const format = useFormatter();
	const t = useTranslations();
	const {
		data,
		isLoading,
	} = useUserDeleteRequestQuery({
		userId: user?.id,
	});
	const loading = data === undefined || isLoading;

	const { mutateAsync: insertRequestMutation } = useUserDeleteRequestInsertMutation();
	const { mutateAsync: deleteRequestMutation } = useUserDeleteRequestDeleteMutation();

	// Handlers
	const handleDeleteButtonPress = () => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(t('pages.settings.account.delete_account.description')),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.delete')),
					onPress: handleInsertRequest,
					style: 'destructive',
				},
			],
			{ cancelable: true, userInterfaceStyle: mode }
		);
	};
	const handleInsertRequest = async () => {
		if (!user) return;
		await insertRequestMutation({
			userId: user.id,
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.request_made')));
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};
	const handleDeleteRequest = async () => {
		if (!user) return;
		await deleteRequestMutation({
			userId: user.id,
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.request_canceled')));
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};

	if (loading) return null;

	return (
		<>
			{!data ? (
				<Button
				variant="link"
				textStyle={{ color: colors.destructive }}
				onPress={handleDeleteButtonPress}
				>
					{upperFirst(t('pages.settings.account.delete_account.button'))}
				</Button>
			) : (
			<>
				<Text style={tw`text-center`}>
					{t.rich('pages.settings.account.delete_account.deletion_requested', {
						date: format.dateTime(new Date(data.delete_after)),
						strong: (chunks) => <Text style={{ color: colors.accentYellow }}>{chunks}</Text>,
					})}
				</Text>
				<Button
				variant="outline"
				textStyle={{ color: colors.accentYellow }}
				onPress={handleDeleteRequest}>
					{upperFirst(t('common.messages.cancel_request'))}
				</Button>
			</>
			)}
		</>
	);
};

export default SettingsAccountScreen;