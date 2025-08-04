import { KeyboardAvoidingView, Platform} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Link } from 'expo-router';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem, Input } from '@/components/ui/Input';
import { upperCase, upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
import app from '@/constants/app';
import { useRandomImage } from '@/hooks/useRandomImage';
import { ImageBackground } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const PADDING = 16;

const LoginScreen = () => {
	const { login } = useAuth();
	const { colors, inset } = useTheme();
	const t = useTranslations();
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ isLoading, setIsLoading ] = useState(false);
	const bgImage = useRandomImage(backgroundImages);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			await login({ email: email, password: password });
		} catch (error) {
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: t('pages.auth.login.form.wrong_credentials'),
				preset: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	}
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
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`w-full gap-4`}>
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
						<Link href="/auth/forgot-password" replace asChild>
							<Text variant="muted" style={tw`text-right`}>{t('pages.auth.login.form.forgot_password')}</Text>
						</Link>
						{/* SUBMIT BUTTON */}
						<Button loading={isLoading} onPress={handleSubmit} style={tw`w-full rounded-xl`}>{t('pages.auth.login.form.submit')}</Button>
					</KeyboardAvoidingView>
					<View style={tw`gap-2 w-full`}>
						<Link href={'/auth/login/otp'} replace asChild>
							<Button variant="outline" icon={Icons.OTP}>
								{upperCase(t('common.messages.otp'))}
							</Button>
						</Link>

					</View>
					{/* SIGNUP */}
					<Text style={[{ color: colors.mutedForeground }, tw`text-right`]}>{t('pages.auth.login.no_account_yet')} <Link href={'/auth/signup'} replace style={{ color: colors.accentYellow }}>{upperFirst(t('common.messages.signup'))}</Link></Text>
				</ScrollView>
			</LinearGradient>
		</ImageBackground>
	)
};

export default LoginScreen;