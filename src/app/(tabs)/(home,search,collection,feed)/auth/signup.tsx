import { useAuth } from '@/providers/AuthProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Link } from 'expo-router';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useDebounce from '@/hooks/useDebounce';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';
import { Icons } from '@/constants/Icons';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem } from '@/components/ui/Input';
import { upperFirst } from 'lodash';
import { ImageBackground } from 'expo-image';
import { useRandomImage } from '@/hooks/useRandomImage';
import { InputOTP } from '@/components/ui/input-otp';
import { Text } from '@/components/ui/text';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useLocale, useTranslations } from 'use-intl';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { View } from '@/components/ui/view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardToolbar } from '@/components/ui/KeyboardToolbar';
import { OAuthProviders } from '@/components/OAuth/OAuthProviders';
import { useToast } from '@/components/Toast';
import { Assets } from '@/constants/Assets';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;
const FULL_NAME_MIN_LENGTH = 1;
const FULL_NAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;

const SignupScreen = () => {
	const supabase = useSupabaseClient();
	const insets = useSafeAreaInsets();
	const { colors, keyboardOffset } = useTheme();
	const toast = useToast();
	const { signup, loginWithOtp } = useAuth();
	const [ isLoading, setIsLoading ] = useState(false);
	const locale = useLocale();
	const t = useTranslations();
	const bgImage = useRandomImage(Assets.screens.auth.signup.background);

	/* ------------------------------- FORM SCHEMA ------------------------------ */
	const signupSchema = useMemo(() => z.object({
		email: z.email({
			error: t('common.form.email.error.invalid')
		}),
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
		full_name: z
			.string()
			.min(FULL_NAME_MIN_LENGTH, {
				message: t('common.form.length.char_min', { count: FULL_NAME_MIN_LENGTH }),
			})
			.max(FULL_NAME_MAX_LENGTH, {
				message: t('common.form.length.char_max', { count: FULL_NAME_MAX_LENGTH }),
			})
			.regex(/^[a-zA-Z0-9\s\S]*$/, {
				message: t('common.form.full_name.schema.format'),
			}),
		password: z
			.string()
			.min(PASSWORD_MIN_LENGTH, {
				message: t('common.form.length.char_min', { count: PASSWORD_MIN_LENGTH }),
			})
			.regex(/[A-Z]/, {
				message: t('common.form.password.schema.uppercase'),
			})
			.regex(/[a-z]/, {
				message: t('common.form.password.schema.lowercase'),
			})
			.regex(/[0-9]/, {
				message: t('common.form.password.schema.number'),
			})
			.regex(/[\W_]/, {
				message: t('common.form.password.schema.special'),
			}),
		confirm_password: z
			.string()
	}).refine(data => data.password === data.confirm_password, {
		message: t('common.form.password.schema.match'),
		path: ['confirm_password'],
	}), [t]);

	type SignupFormValues = z.infer<typeof signupSchema>;

	const defaultValues = useMemo((): Partial<SignupFormValues> => ({
		email: '',
		full_name: '',
		username: '',
		password: '',
		confirm_password: '',
	}), []);
	/* -------------------------------------------------------------------------- */

	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	const usernameAvailability = useUsernameAvailability();
	const usernameToCheck = useDebounce(form.watch('username'), 500);
	// OTP
	const numberOfDigits = 6;
	const [showOtp, setShowOtp] = useState(false);
	const [otp, setOtp] = useState('');

	// Handlers
	const handleSubmit = useCallback(async (data: SignupFormValues) => {
		try {
			setIsLoading(true);
			await signup({
				email: data.email,
				name: data.full_name,
				username: data.username,
				password: data.password,
				language: locale,
			});
			toast.success(upperFirst(t('common.form.success')), { description: t('common.form.email.sent', { email: data.email }) });
			setShowOtp(true);
		} catch (error) {
			if (error instanceof AuthError) {
				switch (error.status) {
					case 422:
						form.setError('email', {
							message: t('common.form.email.error.unavailable'),
						});
						break;
					default:
						toast.error(upperFirst(t('common.messages.error')), { description: error.message });
				}
			} else {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		} finally {
			setIsLoading(false);
		}
	}, [signup, t, locale, form]);
	const handleResendOtp = useCallback(async () => {
		try {
			setIsLoading(true);
			await loginWithOtp(form.getValues('email'));
			toast.success(upperFirst(t('common.form.code_sent')));
		} catch (error) {
			let errorMessage = '';
			if (error instanceof AuthError) {
				switch (error.status) {
					case 429:
						errorMessage = t('common.form.error.too_many_attempts');
						break;
					default:
						errorMessage = error.message;
						break;
				}
			} else {
				errorMessage = upperFirst(t('common.messages.an_error_occurred'));
			}
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		} finally {
			setIsLoading(false);
		}
	}, [loginWithOtp, t]);
	const handleVerifyOtp = useCallback(async (otp: string) => {
		try {
		  setIsLoading(true);
		  const { error } = await supabase.auth.verifyOtp({
			email: form.getValues('email'),
			token: otp,
			type: 'email',
		  });
		  if (error) throw error;
		  toast.success(upperFirst(t('common.form.email.verified')));
		} catch (error) {
			let errorMessage = '';
			if (error instanceof AuthError) {
				switch (error.status) {
				case 403:
					errorMessage = t('common.form.error.invalid_code');
					break
				default:
					errorMessage = error.message;
					break;
				}
		  	} else {
				errorMessage = upperFirst(t('common.messages.an_error_occurred'));
		  	}
			toast.error(upperFirst(t('common.messages.error')), { description: errorMessage });
		} finally {
		  setIsLoading(false);
		}
	}, [supabase, t, form]);

	// useEffects
	useEffect(() => {
		if (!form.formState.errors.username?.message && usernameToCheck) {
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

	return (
	<>
		<ImageBackground source={bgImage} style={{ flex: 1 }}>
			<LinearGradient
			colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
			start={{
				x: 0,
				y: 0,
			}}
			end={{
				x: 0,
				y: 0.4,
			}}
			style={tw`flex-1`}
			>
				<KeyboardAwareScrollView
				contentContainerStyle={[
					tw`flex-1 flex-grow justify-end items-center`,
					{
						gap: GAP,
						paddingLeft: insets.left + PADDING_HORIZONTAL,
						paddingRight: insets.right + PADDING_HORIZONTAL,
						paddingBottom: insets.bottom + PADDING_VERTICAL,
					}
				]}
				keyboardShouldPersistTaps='handled'
				extraKeyboardSpace={-139 - keyboardOffset}
				>
					{!showOtp ? (
						<>
						<View style={[tw`w-full`, { gap: GAP }]}>
							<GroupedInput title={upperFirst(t('common.messages.signup'))} titleStyle={tw`text-center text-xl font-bold`}>
								<Controller
								name="email"
								control={form.control}
								render={({field: { onChange, onBlur, value }}) => (
									<GroupedInputItem
									icon={Icons.Mail}
									placeholder={upperFirst(t('common.form.email.label'))}
									nativeID='email'
									inputMode='email'
									autoComplete='email'
									autoCapitalize='none'
									value={value}
									onChangeText={value => onChange(value)}
									disabled={isLoading}
									keyboardType='email-address'
									onBlur={onBlur}
									error={form.formState.errors.email?.message}
									/>
								)}
								/>
								<Controller
								name='username'
								control={form.control}
								render={({ field: { onChange, onBlur, value } }) => (
									<GroupedInputItem
									icon={Icons.User}
									placeholder={t('pages.settings.account.username.label')}
									disabled={isLoading}
									autoComplete='username-new'
									autoCapitalize='none'
									value={value}
									autoCorrect={false}
									onBlur={onBlur}
									onChangeText={onChange}
									rightComponent={((form.formState.errors.username?.message !== t('common.form.username.schema.unavailable'))  && usernameAvailability.isAvailable !== undefined) ? (
										usernameAvailability.isLoading ? <Icons.Loader size={16}/>
										: (
											<View style={[{ backgroundColor: usernameAvailability.isAvailable ? colors.success : colors.destructive }, tw`rounded-full h-4 w-4 items-center justify-center`]}>
												{usernameAvailability.isAvailable ? (
													<Icons.Check size={12} color={colors.successForeground} />
												) : <Icons.Cancel size={12} color={colors.destructiveForeground} />}
											</View>
										)
									) : undefined}
									error={form.formState.errors.username?.message}
									/>
								)}
								/>
								<Controller
								name="full_name"
								control={form.control}
								render={({field: { onChange, onBlur, value }}) => (
									<GroupedInputItem
									placeholder={upperFirst(t('common.form.full_name.label'))}
									icon={Icons.Add}
									nativeID='full_name'
									value={value}
									autoComplete="given-name"
									autoCapitalize='words'
									onBlur={onBlur}
									onChangeText={onChange}
									disabled={isLoading}
									error={form.formState.errors.full_name?.message}
									/>
								)}
								/>
								<Controller
								name="password"
								control={form.control}
								render={({field: { onChange, onBlur, value }}) => (
									<GroupedInputItem
									label={null}
									placeholder={t('common.form.password.placeholder')}
									nativeID='password'
									value={value}
									onChangeText={onChange}
									autoComplete='new-password'
									autoCapitalize='none'
									onBlur={onBlur}
									disabled={isLoading}
									error={form.formState.errors.password?.message}
									type='password'
									/>
								)}
								/>
								<Controller
								name="confirm_password"
								control={form.control}
								render={({field: { onChange, onBlur, value }}) => (
									<GroupedInputItem
									label={null}
									placeholder={t('common.form.password.confirm.label')}
									nativeID='confirm_password'
									value={value}
									onChangeText={onChange}
									autoCapitalize='none'
									onBlur={onBlur}
									disabled={isLoading}
									error={form.formState.errors.confirm_password?.message}
									type='password'
									/>
								)}
								/>
							</GroupedInput>
							{/* SUBMIT BUTTON */}
							<Button
							onPress={form.handleSubmit(handleSubmit)}
							loading={isLoading}
							style={tw.style('w-full rounded-xl')}
							>
								{upperFirst(t('common.messages.signup'))}
							</Button>
						</View>
						<View style={[tw`w-full`, { gap: GAP }]}>
							<Text style={tw`text-center`} textColor='muted'>{upperFirst(t('common.messages.or_continue_with'))}</Text>
							<OAuthProviders />
						</View>
						{/* SIGNUP */}
						<Text style={[{ color: colors.mutedForeground }, tw.style('text-right')]}>{t('pages.auth.signup.return_to_login')} <Link href={'/auth/login'} replace style={{ color: colors.accentYellow }}>{upperFirst(t('common.messages.login'))}</Link></Text>
						</>
					) : (
						<>
						<View style={tw`gap-2 items-center`}>
							<Text variant='title'>
								{t('pages.auth.signup.confirm_form.label')}
							</Text>
							<Text textColor='muted'>
								{t('pages.auth.signup.confirm_form.description', { email: form.getValues('email') })}
							</Text>
						</View>
						<InputOTP
						length={numberOfDigits}
						value={otp}
						onChangeText={setOtp}
						onComplete={handleVerifyOtp}
						/>
						<View style={tw`items-center`}>
							<Text textColor='muted'>
								{t('common.form.error.not_received_code')}{' '}
							</Text>
							<Button
							variant="ghost"
							className='p-0'
							disabled={isLoading}
							onPress={handleResendOtp}
							>
								{t('common.form.resend_code')}
							</Button>
						</View>
						</>
					)}
				</KeyboardAwareScrollView>
				<KeyboardToolbar />
			</LinearGradient>
		</ImageBackground>
	</>
	)
};

export default SignupScreen;