import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GroupedInput, GroupedInputItem, Input } from '@/components/ui/input';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import * as Burnt from 'burnt';
import app from '@/constants/app';
import { useRandomImage } from '@/hooks/useRandomImage';
import { ImageBackground } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const PADDING = 16;

const LoginScreen = () => {
	const { login } = useAuth();
	const { colors, inset } = useTheme();
	const { t } = useTranslation();
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
						<TouchableOpacity style={tw`w-full`}>
							<Text style={[{ color: colors.mutedForeground }, tw`text-right`]}>{t('pages.auth.login.form.forgot_password')}</Text>
						</TouchableOpacity>
						{/* SUBMIT BUTTON */}
						<Button loading={isLoading} onPress={handleSubmit} style={tw`w-full rounded-xl`}>{t('pages.auth.login.form.submit')}</Button>
					</KeyboardAvoidingView>
					{/* SIGNUP */}
					<Text style={[{ color: colors.mutedForeground }, tw`text-right`]}>{t('pages.auth.login.no_account_yet')} <Link href={'/auth/signup'} replace style={{ color: colors.accentYellow }}>{t('common.word.signup')}</Link></Text>
				</ScrollView>
			</LinearGradient>
		</ImageBackground>
	)
};

export default LoginScreen;