import { KeyboardAvoidingView, Platform, View} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useDebounce from '@/hooks/useDebounce';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem, Input } from '@/components/ui/input';
import { upperFirst } from 'lodash';
import app from '@/constants/app';
import { ImageBackground } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import * as Burnt from 'burnt';
import { useRandomImage } from '@/hooks/useRandomImage';
import { InputOTP } from '@/components/ui/input-otp';
import { Text } from '@/components/ui/text';
import { useSupabaseClient } from '@/providers/SupabaseProvider';

const backgroundImages = [
	require('@/assets/images/auth/signup/background/1.gif'),
]

const PADDING = 16;

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;
const FULL_NAME_MIN_LENGTH = 1;
const FULL_NAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;

const SignupScreen = () => {
	const supabase = useSupabaseClient();
	const { colors, inset } = useTheme();
	const { signup, loginWithOtp } = useAuth();
	const [ isLoading, setIsLoading ] = useState(false);
	const { t, i18n } = useTranslation();
	const bgImage = useRandomImage(backgroundImages);

	/* ------------------------------- FORM SCHEMA ------------------------------ */
	const signupSchema = z.object({
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
	});

	type SignupFormValues = z.infer<typeof signupSchema>;

	const defaultValues: Partial<SignupFormValues> = {
		email: '',
		full_name: '',
		username: '',
		password: '',
		confirm_password: '',
	};
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
	const handleSubmit = async (data: SignupFormValues) => {
		try {
			setIsLoading(true);
			await signup({
				email: data.email,
				name: data.full_name,
				username: data.username,
				password: data.password,
				language: i18n.language,
			});
			Burnt.toast({
				title: upperFirst(t('common.form.success')),
				message: t('common.form.email.sent', { email: data.email }),
				preset: 'done',
			});
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
						Burnt.toast({
							title: upperFirst(t('common.messages.error')),
							message: error.message,
							preset: 'error',
						});
				}
			} else {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.errors.an_error_occurred')),
					preset: 'error',
				});
			}
		} finally {
			setIsLoading(false);
		}
	};
	const handleResendOtp = async () => {
		try {
			setIsLoading(true);
			await loginWithOtp(form.getValues('email'));
			Burnt.toast({
				title: upperFirst(t('common.form.code_sent')),
				preset: 'done',
			});
		} catch (error) {
			if (error instanceof AuthError) {
				switch (error.status) {
					case 429:
						Burnt.toast({
							title: upperFirst(t('common.form.error.too_many_attempts')),
							preset: 'error',
						});
						break;
					default:
						Burnt.toast({
							title: upperFirst(t('common.messages.error')),
							message: error.message,
							preset: 'error',
						});
				}
			} else {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.errors.an_error_occurred')),
					preset: 'error',
				});
			}
		} finally {
			setIsLoading(false);
		}
	};
	const handleVerifyOtp = async (otp: string) => {
		try {
		  setIsLoading(true);
		  const { error } = await supabase.auth.verifyOtp({
			email: form.getValues('email'),
			token: otp,
			type: 'email',
		  });
		  if (error) throw error;
		  Burnt.toast({
			title: upperFirst(t('common.form.email.verified')),
			preset: 'done',
		  });
		} catch (error) {
		  if (error instanceof AuthError) {
			switch (error.status) {
			  case 403:
				// toast.error(common('form.error.invalid_code'));
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.form.error.invalid_code')),
					preset: 'error',
				});
				break
			  default:
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: error.message,
					preset: 'error',
				});
			}
		  } else {
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: upperFirst(t('common.errors.an_error_occurred')),
				preset: 'error',
			});
		  }
		} finally {
		  setIsLoading(false);
		}
	};
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
				<ScrollView
				contentContainerStyle={[
					tw`flex-1 gap-6 justify-end items-center`,
					{
						paddingBottom: inset.bottom + PADDING,
						paddingLeft: inset.left + PADDING,
						paddingRight: inset.right + PADDING,
					}
				]}
				>
					{!showOtp ? (
						<>
						<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : undefined}
						style={tw.style('w-full gap-4')}
						>
							<GroupedInput title={t('pages.auth.signup.label', { app: app.name })} titleStyle={tw`text-center text-xl font-bold`}>
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
								{t('pages.auth.signup.form.submit')}
							</Button>
						</KeyboardAvoidingView>
						{/* SIGNUP */}
						<Text style={[{ color: colors.mutedForeground }, tw.style('text-right')]}>{t('pages.auth.signup.return_to_login')} <Link href={'/auth/login'} replace style={{ color: colors.accentYellow }}>{t('common.word.login')}</Link></Text>
						</>
					) : (
						<>
						<View style={tw`gap-2 items-center`}>
							<Text variant='title'>
								{t('pages.auth.signup.confirm_form.label')}
							</Text>
							<Text variant='muted'>
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
							<Text variant='muted'>
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
				</ScrollView>
			</LinearGradient>
		</ImageBackground>
	)
};

export default SignupScreen;