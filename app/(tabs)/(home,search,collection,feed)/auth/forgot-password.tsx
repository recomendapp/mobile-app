import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Link, useNavigation } from 'expo-router';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem, Input } from '@/components/ui/Input';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
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
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { View } from '@/components/ui/view';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const ForgotPasswordScreen = () => {
	const supabase = useSupabaseClient();
	const { resetPasswordForEmail } = useAuth();
	const { colors, inset } = useTheme();
	const t = useTranslations();
	const [ isLoading, setIsLoading ] = useState(false);
	const bgImage = useRandomImage(backgroundImages);
	const navigationHeaderHeight = useHeaderHeight();
	const navigation = useNavigation();
	const routes = navigation.getState()?.routes;
	const prevRoute = routes? routes[routes.length - 2] : null;
	// OTP
	const numberOfDigits = 6;
	const [showOtp, setShowOtp] = useState<boolean>(false);
	const [otp, setOtp] = useState('');

	/* ------------------------------- FORM SCHEMA ------------------------------ */
	const forgotPasswordSchema = z.object({
		email: z.email({
			error: t('common.form.email.error.invalid')
		})
	});
	type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
	const defaultValues: Partial<ForgotPasswordFormValues> = {
		email: '',
	};
	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	/* -------------------------------------------------------------------------- */

	// Handlers
	const handleSubmit = async (data: ForgotPasswordFormValues) => {
		try {
			setIsLoading(true);
			await resetPasswordForEmail(data.email);
			Burnt.toast({
				title: upperFirst(t('common.form.code_sent')),
				preset: "done",
			});
			setShowOtp(true);
		} catch (error) {
			if (error instanceof z.ZodError) {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: error.message,
					preset: 'error',
					haptic: 'error',
				});
			} else if (error instanceof AuthError) {
				switch (error.status) {
					case 429:
						Burnt.toast({
							title: upperFirst(t('common.messages.error')),
							message: t('common.form.error.too_many_attempts'),
							preset: 'error',
							haptic: 'error',
						});
						break;
					default:
						Burnt.toast({
							title: upperFirst(t('common.messages.error')),
							message: error.message,
							preset: 'error',
							haptic: 'error',
						});
						break;
				}
			} else {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
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
				type: 'recovery',
			});
			if (error) throw error;
			Burnt.toast({
				title: upperFirst(t('common.form.code_verified')),
				preset: 'done',
			});
		} catch (error) {
			if (error instanceof AuthError) {
				switch (error.status) {
				case 403:
					Burnt.toast({
						title: upperFirst(t('common.form.error.invalid_code')),
						preset: 'error',
						haptic: 'error',
					});
					break;
				default:
					Burnt.toast({
						title: upperFirst(t('common.messages.error')),
						message: error.message,
						preset: 'error',
						haptic: 'error',
					});
					break;
				}
			} else {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		} finally {
			setIsLoading(false);
		}
	};
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
						paddingTop: PADDING_VERTICAL,
						paddingLeft: inset.left + PADDING_HORIZONTAL,
						paddingRight: inset.right + PADDING_HORIZONTAL,
						paddingBottom: inset.bottom + PADDING_VERTICAL,
					}
				]}
				bottomOffset={navigationHeaderHeight}
				>
					{!showOtp ? (
						<>
							<View style={[tw`w-full`, { gap: GAP }]}>
								<GroupedInput title={t('pages.auth.forgot_password.label')} titleStyle={tw`text-center text-xl font-bold`}>
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
								<Button loading={isLoading} onPress={form.handleSubmit(handleSubmit)} style={tw`w-full rounded-xl`}>{t('pages.auth.forgot_password.form.submit')}</Button>
							</View>
							<Text textColor='muted' style={tw`text-center`}>{t('pages.auth.forgot_password.return_to_login')} <Link href={prevRoute?.name === 'login/index' ? '../' : '/auth/login'} style={{ color: colors.accentYellow }}>{upperFirst(t('common.messages.login'))}</Link></Text>
						</>
					) : (
						<>
						<View style={tw`gap-2 items-center`}>
							<Text variant='title'>
								{t('pages.auth.forgot_password.confirm_form.label')}
							</Text>
							<Text textColor='muted'>
								{t('pages.auth.forgot_password.confirm_form.description', { email: form.getValues('email') })}
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
			</LinearGradient>
		</ImageBackground>
	)
};

export default ForgotPasswordScreen;