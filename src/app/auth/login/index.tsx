import { useAuth } from '@/providers/AuthProvider';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Link, useRouter } from 'expo-router';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem } from '@/components/ui/Input';
import { upperCase, upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import app from '@/constants/app';
import { useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { KeyboardToolbar } from '@/components/ui/KeyboardToolbar';
import { OAuthProviders } from '@/components/OAuth/OAuthProviders';
import { useToast } from '@/components/Toast';
import { KeyboardAwareScrollView } from '@/components/ui/KeyboardAwareScrollView';
import { AuthError } from '@supabase/supabase-js';
import { logger } from '@/logger';
import { LoopCarousel } from '@/components/ui/LoopCarousel';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIBackgroundsQuery } from '@/api/ui/uiQueries';

const LoginScreen = () => {
	const { login } = useAuth();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const router = useRouter();
	const toast = useToast();
	const t = useTranslations();
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ isLoading, setIsLoading ] = useState(false);

	const {
		data: backgrounds,
	} = useUIBackgroundsQuery();

	const handleSubmit = useCallback(async () => {
		try {
			setIsLoading(true);
			await login({ email: email, password: password });
			logger.metric('account:loggedIn', {
				logContext: 'LoginForm',
				withPassword: true,
			})
		} catch (error) {
			if (error instanceof AuthError) {
				if (error.code === 'invalid_credentials') {
					logger.metric('account:loginFailed', {
						logContext: 'LoginForm',
						reason: error.code,
					})
					return toast.error(t('pages.auth.login.form.wrong_credentials'));
				}
			}
			logger.error('login error', { error });
			toast.error(upperFirst(t('common.messages.an_error_occurred')));
		} finally {
			setIsLoading(false);
		}
	}, [email, password, login, t, toast]);

	return (
	<>
		{backgrounds && (
          <LoopCarousel
          items={backgrounds}
          containerStyle={tw`absolute inset-0`}
          renderItem={(item) => (
            <Image source={item.localUri} contentFit="cover" style={tw`w-full h-full`} />
          )}
          />
        )}
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
				tw`flex-1 flex-grow justify-end items-center`,
				{
					gap: GAP,
					paddingLeft: insets.left + PADDING_HORIZONTAL,
					paddingRight: insets.right + PADDING_HORIZONTAL,
					paddingBottom: insets.bottom + PADDING_VERTICAL,
				}
			]}
			keyboardShouldPersistTaps='handled'
			extraKeyboardSpace={-180}
			>
				<View style={[tw`w-full`, { gap: GAP }]}>
					<GroupedInput title={t('pages.auth.login.label', { app: app.name })} titleStyle={tw`text-center text-xl font-bold`}>
						<GroupedInputItem
						icon={Icons.Mail}
						nativeID="email"
						placeholder={upperFirst(t('common.form.email.label'))}
						autoComplete='email'
						autoCapitalize='none'
						value={email}
						onChangeText={setEmail}
						disabled={isLoading}
						keyboardType='email-address'
						/>
						<GroupedInputItem
						label={null}
						nativeID="password"
						placeholder="Password"
						autoComplete='password'
						autoCapitalize='none'
						value={password}
						onChangeText={setPassword}
						disabled={isLoading}
						type="password"
						/>
					</GroupedInput>
					{/* FORGOT PASSWORD */}
					<Link href="/auth/forgot-password" asChild>
						<Text textColor='muted' style={tw`text-right`}>{t('pages.auth.login.form.forgot_password')}</Text>
					</Link>
					{/* SUBMIT BUTTON */}
					<Button loading={isLoading} onPress={handleSubmit} style={tw`w-full rounded-xl`}>{t('pages.auth.login.form.submit')}</Button>
				</View>
				<View style={[tw`w-full`, { gap: GAP }]}>
					<Text style={tw`text-center`} textColor='muted'>{upperFirst(t('common.messages.or_continue_with'))}</Text>
					<Button variant="muted" onPress={() => router.push('/auth/login/otp')} icon={Icons.OTP}>
						{upperCase(t('common.messages.otp'))}
					</Button>
					<OAuthProviders />
				</View>
				{/* SIGNUP */}
				<Text style={[{ color: colors.mutedForeground }, tw`text-right`]}>{t('pages.auth.login.no_account_yet')} <Link href={'/auth/signup'} replace style={{ color: colors.accentYellow }}>{upperFirst(t('common.messages.signup'))}</Link></Text>
			</KeyboardAwareScrollView>
			<KeyboardToolbar />
		</LinearGradient>
	</>
	)
};

export default LoginScreen;