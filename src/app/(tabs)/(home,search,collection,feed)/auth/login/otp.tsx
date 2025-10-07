import { useAuth } from '@/providers/AuthProvider';
import { useCallback, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Link, useNavigation } from 'expo-router';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem } from '@/components/ui/Input';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useRandomImage } from '@/hooks/useRandomImage';
import { ImageBackground } from 'expo-image';
import { useTranslations } from 'use-intl';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthError } from '@supabase/supabase-js';
import { Text } from '@/components/ui/text';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { InputOTP } from '@/components/ui/input-otp';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { View } from '@/components/ui/view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardToolbar } from '@/components/ui/KeyboardToolbar';
import { useHeaderHeight } from '@react-navigation/elements';
import { useToast } from '@/components/Toast';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const LoginOtpScreen = () => {
	const supabase = useSupabaseClient();
	const { loginWithOtp } = useAuth();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const toast = useToast();
	const navigationHeaderHeight = useHeaderHeight();
	const t = useTranslations();
	const [ isLoading, setIsLoading ] = useState(false);
	const bgImage = useRandomImage(backgroundImages);
	const navigation = useNavigation();
	const routes = navigation.getState()?.routes;
	const prevRoute = routes? routes[routes.length - 2] : null;
	// OTP
	const numberOfDigits = 6;
	const [showOtp, setShowOtp] = useState<boolean>(false);
	const [otp, setOtp] = useState('');

	/* ------------------------------- FORM SCHEMA ------------------------------ */
	const forgotPasswordSchema = useMemo(() => z.object({
		email: z.email({
			error: t('common.form.email.error.invalid')
		})
	}), [t]);
	type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
	const defaultValues = useMemo((): Partial<ForgotPasswordFormValues> => ({
		email: '',
	}), []);
	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	/* -------------------------------------------------------------------------- */

	// Handlers
	const handleSubmit = useCallback(async (data: ForgotPasswordFormValues) => {
		try {
			setIsLoading(true);
			await loginWithOtp(data.email);
			toast.success(upperFirst(t('common.form.code_sent')));
			setShowOtp(true);
		} catch (error) {
			let errorMessage = '';
			if (error instanceof z.ZodError) {
				errorMessage = error.message;
			} else if (error instanceof AuthError) {
				switch (error.status) {
					case 500:
						errorMessage = t('pages.auth.login.otp.form.error.no_user_found');
						break;
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
			toast.success(upperFirst(t('common.form.code_verified')));
		} catch (error) {
			let errorMessage = '';
			if (error instanceof AuthError) {
				switch (error.status) {
				case 400:
					errorMessage = t('common.form.error.invalid_code');
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
	}, [supabase, form, t]);
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
				y: 0.7,
			}}
			style={tw`flex-1`}
			>
				<KeyboardAwareScrollView
				contentContainerStyle={[
					tw`flex-1 justify-end items-center`,
					{
						gap: GAP,
						paddingTop: navigationHeaderHeight,
						paddingLeft: insets.left + PADDING_HORIZONTAL,
						paddingRight: insets.right + PADDING_HORIZONTAL,
						paddingBottom: insets.bottom + PADDING_VERTICAL,
					}
				]}
				keyboardShouldPersistTaps='handled'
				>
					{!showOtp ? (
						<>
							<View style={[tw`w-full`, { gap: GAP }]}>
								<GroupedInput title={t('common.messages.otp')} titleStyle={tw`text-center text-xl font-bold`}>
									<Controller
										name="email"
										control={form.control}
										render={({field: { onChange, onBlur, value }}) => (
											<GroupedInputItem
											icon={Icons.Mail}
											nativeID="email"
											placeholder={upperFirst(t('common.form.email.label'))}
											autoComplete='email'
											autoCapitalize='none'
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											disabled={isLoading}
											keyboardType='email-address'
											error={form.formState.errors.email?.message}
											/>
										)}
									/>
								</GroupedInput>
								{/* SUBMIT BUTTON */}
								<Button loading={isLoading} onPress={form.handleSubmit(handleSubmit)} style={tw`w-full rounded-xl`}>{t('pages.auth.login.otp.form.submit')}</Button>
							</View>
							<Text textColor='muted' style={tw`text-center`}>{t('pages.auth.login.otp.password_login')} <Link href={prevRoute?.name === 'login/index' ? '../' : '/auth/login'} replace style={{ color: colors.accentYellow }}>{upperFirst(t('common.messages.login'))}</Link></Text>
						</>
					) : (
						<>
						<View style={tw`gap-2 items-center`}>
							<Text variant='title'>
								{t('pages.auth.login.otp.confirm_form.label')}
							</Text>
							<Text textColor='muted'>
								{t('pages.auth.login.otp.confirm_form.description', { email: form.getValues('email') })}
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
							onPress={form.handleSubmit(handleSubmit)}
							>
								{t('common.form.resend_code')}
							</Button>
						</View>
						</>
					)}
					{/* RETURNS TO LOGIN */}
				</KeyboardAwareScrollView>
				<KeyboardToolbar />
			</LinearGradient>
		</ImageBackground>
	)
};

export default LoginOtpScreen;