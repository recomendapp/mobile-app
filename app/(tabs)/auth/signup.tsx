import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View} from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { useEffect, useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, ButtonText } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from 'expo-router';
import * as z from 'zod';
import { Controller, Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useDebounce from '@/hooks/useDebounce';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { InputPassword } from '@/components/ui/InputPassword';
import { Label } from '@/components/ui/Label';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';

const backgroundImages = [
	require('@/assets/images/auth/signup/background/1.gif'),
]

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;
const FULL_NAME_MIN_LENGTH = 1;
const FULL_NAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;

const SignupScreen = () => {
	const { colors } = useTheme();
	const { login, signup } = useAuth();
	const [ isLoading, setIsLoading ] = useState(false);
	const { t, i18n } = useTranslation();

	/* ------------------------------- FORM SCHEMA ------------------------------ */
	const signupSchema = z.object({
		email: z.string().email({
			// message: common('form.email.error.invalid'),
		}),
		username: z
		.string()
		.min(USERNAME_MIN_LENGTH, {
			// message: t('common.form.length.char_min', { count: USERNAME_MIN_LENGTH }),
		})
		.max(USERNAME_MAX_LENGTH, {
			// message: common('form.length.char_max', { count: USERNAME_MAX_LENGTH }),
		})
		.regex(/^[^\W]/, {
			// message: common('form.username.schema.first_char'),
		})
		.regex(/^(?!.*\.\.)/, {
			// message: common('form.username.schema.double_dot'),
		})
		.regex(/^(?!.*\.$)/, {
			// message: common('form.username.schema.ends_with_dot'),
		})
		.regex(/^[\w.]+$/, {
			// message: common('form.username.schema.format'),
		}),
		full_name: z
		.string()
		.min(FULL_NAME_MIN_LENGTH, {
			// message: common('form.length.char_min', { count: FULL_NAME_MIN_LENGTH }),
		})
		.max(FULL_NAME_MAX_LENGTH, {
			// message: common('form.length.char_max', { count: FULL_NAME_MAX_LENGTH }),
		})
		.regex(/^[a-zA-Z0-9\s\S]*$/, {
			// message: common('form.full_name.schema.format'),
		}),
		password: z
		.string()
		.min(PASSWORD_MIN_LENGTH, {
			// message: common('form.length.char_min', { count: PASSWORD_MIN_LENGTH }),
		})
		.regex(/[A-Z]/, {
			// message: common('form.password.schema.uppercase'),
		})
		.regex(/[a-z]/, {
			// message: common('form.password.schema.lowercase'),
		})
		.regex(/[0-9]/, {
			// message: common('form.password.schema.number'),
		})
		.regex(/[\W_]/, {
			// message: common('form.password.schema.special'),
		}),
		confirm_password: z
		.string()
	}).refine(data => data.password === data.confirm_password, {
		// message: common('form.password.schema.match'),
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
	const [showOtp, setShowOtp] = useState<boolean>(false);

	useEffect(() => {
		if (!form.formState.errors.username?.message && usernameToCheck) {
			usernameAvailability.check(usernameToCheck);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usernameToCheck]);

	useEffect(() => {
		if (usernameAvailability.isAvailable === false) {
			form.setError('username', {
				message: t('common.form.username.schema.unavailable'),
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usernameAvailability.isAvailable, t]);

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
			// toast.success(t('form.success', { email: data.email }));
			setShowOtp(true);
		} catch (error) {
			if (error instanceof AuthError) {
				switch (error.status) {
					case 422:
						Alert.alert(t('common.form.email.error.unavailable'));
						break;
					case 500:
						Alert.alert(t('common.form.username.schema.unavailable'));
						break;
					default:
						Alert.alert(error.message);
				}
			} else {
				Alert.alert(t('common.error'));
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ImageBackground source={backgroundImages[0]} style={{ flex: 1 }}>
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
			style={{
				flex: 1,
				flexDirection: 'column',
				justifyContent: 'flex-end',
				alignItems: 'center',
				gap: 24,
				padding: 32,
				paddingBottom: 114
			}}
			>
				<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={tw.style('w-full gap-4')}
				>
					{/* EMAIL */}
					<View style={tw.style('w-full gap-1')}>
						<Label nativeID='email'>{t('common.form.email.label')}</Label>
						<Controller
							control={form.control}
							render={({field: { onChange, onBlur, value }}) => (
							<>
							<Input
								nativeID='email'
								onBlur={onBlur}
								onChangeText={value => onChange(value)}
								value={value}
								inputMode='email'
								autoComplete="email"
								autoCapitalize='none'
								placeholder={t('common.form.email.placeholder')}
							/>
							{form.formState.errors.email?.message ? (
								<Text className='text-destructive'>{form.formState.errors.email.message}</Text>
							) : null}
							</>
							)}
							name="email"
							rules={{ required: true }}
						/>
					</View>
					<View style={tw.style('w-full gap-1')}>
						<Label nativeID='username'>{t('common.form.username.label')}</Label>
						<Controller
							control={form.control}
							render={({field: { onChange, onBlur, value }}) => (
							<View style={tw.style('relative')}>
								<Input
									nativeID='username'
									onBlur={onBlur}
									onChangeText={value => onChange(value)}
									value={value}
									autoComplete="username"
									autoCapitalize='none'
									placeholder={t('common.form.username.placeholder')}
									style={[usernameAvailability.isLoading && tw.style('pr-8')]}
								/>
								{usernameAvailability.isLoading ? (
									<View style={tw.style('absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full flex justify-center items-center h-6 w-6')}>
										<Icons.loader size={16} />
									</View>
								) : null}
								{form.formState.errors.username?.message ? (
									<Text style={[{ color: colors.destructive }]}>{form.formState.errors.username.message}</Text>
								) : null}
							</View>
							)}
							name="username"
							rules={{ required: true }}
						/>
					</View>
					<View style={tw.style('w-full gap-1')}>
						<Label nativeID='full_name'>{t('common.form.full_name.label')}</Label>
						<Controller
							control={form.control}
							render={({field: { onChange, onBlur, value }}) => (
							<>
							<Input
								nativeID='full_name'
								onBlur={onBlur}
								onChangeText={value => onChange(value)}
								value={value}
								autoComplete="given-name"
								autoCapitalize='words'
								placeholder={t('common.form.full_name.placeholder')}
							/>
							{form.formState.errors.full_name?.message ? (
								<Text style={[{ color: colors.destructive }]}>{form.formState.errors.full_name.message}</Text>
							) : null}
							</>
							)}
							name="full_name"
							rules={{ required: true }}
						/>
					</View>
					<View style={tw.style('w-full gap-1')}>
						<Label nativeID='password'>{t('common.form.password.label')}</Label>
						<Controller
							control={form.control}
							render={({field: { onChange, onBlur, value }}) => (
							<>
							<InputPassword
								onBlur={onBlur}
								onChangeText={value => onChange(value)}
								value={value}
								autoComplete="new-password"
								autoCapitalize='none'
								placeholder={t('common.form.password.placeholder')}
							/>
							{form.formState.errors.password?.message ? (
								<Text style={[{ color: colors.destructive }]}>{form.formState.errors.password.message}</Text>
							) : null}
							</>
							)}
							name="password"
							rules={{ required: true }}
						/>
					</View>
					<View style={tw.style('w-full gap-1')}>
						<Label nativeID='password'>{t('common.form.password.confirm.label')}</Label>
						<Controller
							control={form.control}
							render={({field: { onChange, onBlur, value }}) => (
							<>
							<InputPassword
								onBlur={onBlur}
								onChangeText={value => onChange(value)}
								value={value}
								placeholder={t('common.form.password.confirm.placeholder')}
							/>
							{form.formState.errors.confirm_password?.message ? (
								<Text style={[{ color: colors.destructive }]}>{form.formState.errors.confirm_password.message}</Text>
							) : null}
							</>
							)}
							name="confirm_password"
							rules={{ required: true }}
						/>
					</View>
				{/* SUBMIT BUTTON */}
				<Button onPress={form.handleSubmit(handleSubmit)} disabled={isLoading} style={tw.style('w-full rounded-xl')}>
					{/* {isLoading ? <Icons.loading /> : null} */}
					<ButtonText style={tw.style('font-bold text-xl')}>{t('common.word.signup')}</ButtonText>
				</Button>
				</KeyboardAvoidingView>
				{/* SIGNUP */}
				<Text style={[{ color: colors.mutedForeground }, tw.style('text-right')]}>Already have an account? <Link href={'/auth/login'} style={{ color: colors.accentYellow }}>{t('common.word.login')}</Link></Text>
			</LinearGradient>
		</ImageBackground>
	)
};

export default SignupScreen;