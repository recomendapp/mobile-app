import { ImageBackground, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, ButtonText } from '@/components/ui/Button';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { Input } from '@/components/ui/input';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import { InputPassword } from '@/components/ui/InputPassword';
import * as Burnt from 'burnt';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const LoginScreen = () => {
	const { login } = useAuth();
	const { colors } = useTheme();
	const { t } = useTranslation();
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ isLoading, setIsLoading ] = useState(false);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			await login({ email: email, password: password });
		} catch (error) {
			if (error instanceof AuthError) {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: error.message,
					preset: 'error',
				});
			} else {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					preset: 'error',
				});
			}
		} finally {
			setIsLoading(false);
		}
	}
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
				y: 0.7,
			}}
			style={[
				{
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'flex-end',
					alignItems: 'center',
					gap: 24,
					paddingBottom: 114
				},
				tw`px-4`
			]}
			>
				<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={tw.style('w-full gap-4')}
				>
					<Input
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
					<InputPassword
					label={null}
					nativeID="password"
					placeholder="Password"
					autoComplete='password'
					autoCapitalize='none'
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					disabled={isLoading}
					/>
					{/* FORGOT PASSWORD */}
					<TouchableOpacity style={tw.style('w-full')}>
						<Text style={[{ color: colors.mutedForeground }, tw.style('text-right')]}>{t('pages.auth.login.form.forgot_password')}</Text>
					</TouchableOpacity>
					{/* SUBMIT BUTTON */}
					<Button onPress={handleSubmit} disabled={isLoading} style={tw.style('w-full rounded-xl')}>
						<ButtonText style={tw.style('font-bold text-xl')}>{t('common.word.login')}</ButtonText>
					</Button>
				</KeyboardAvoidingView>
				{/* SIGNUP */}
				<Text style={[{ color: colors.mutedForeground }, tw.style('text-right')]}>{t('pages.auth.login.no_account_yet')} <Link href={'/auth/signup'} replace style={{ color: colors.accentYellow }}>{t('common.word.signup')}</Link></Text>
			</LinearGradient>
		</ImageBackground>
	)
};

export default LoginScreen;