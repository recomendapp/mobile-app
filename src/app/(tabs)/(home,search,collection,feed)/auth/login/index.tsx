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
import * as Burnt from 'burnt';
import app from '@/constants/app';
import { useRandomImage } from '@/hooks/useRandomImage';
import { Image, ImageBackground } from 'expo-image';
import { useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { GAP, HEIGHT, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardToolbar } from '@/components/ui/KeyboardToolbar';
import { useHeaderHeight } from '@react-navigation/elements';
import { Provider } from '@supabase/supabase-js';
import { LegendList } from '@legendapp/list';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

type Providers = {
	name: Provider;
	label: string;
	img: any;
}[];


const providers: Providers = [
	{
		name: "google",
		label: "Google",
		img: require("@/assets/images/providers/google.png")
	},
	{
		name: "github",
		label: "GitHub",
		img: require("@/assets/images/providers/github.png"),
	}
]

const LoginScreen = () => {
	const { login, loginWithOAuth } = useAuth();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const router = useRouter();
	const navigationHeaderHeight = useHeaderHeight();
	const t = useTranslations();
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ isLoading, setIsLoading ] = useState(false);
	const bgImage = useRandomImage(backgroundImages);

	const handleSubmit = useCallback(async () => {
		try {
			setIsLoading(true);
			await login({ email: email, password: password });
		} catch (error) {
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: t('pages.auth.login.form.wrong_credentials'),
				preset: 'error',
				haptic: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	}, [email, password, login, t]);

	const handleProviderPress = useCallback(async (provider: Provider) => {
		try {
			await loginWithOAuth(provider);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === 'cancelled') return;
			}
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		}
	}, [loginWithOAuth]);

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
						<LegendList
						data={providers}
						renderItem={({ item }) => (
							<Button variant='muted' onPress={() => handleProviderPress(item.name)}>
								<Image source={item.img} style={{ height: 18, width: 18 }} contentFit="cover" />
								<Text style={{ color: colors.foreground }}>{item.label}</Text>
							</Button>
						)}
						keyExtractor={(item) => item.name}
						numColumns={2}
						contentContainerStyle={{ gap: GAP }}
						/>
					</View>
					{/* SIGNUP */}
					<Text style={[{ color: colors.mutedForeground }, tw`text-right`]}>{t('pages.auth.login.no_account_yet')} <Link href={'/auth/signup'} replace style={{ color: colors.accentYellow }}>{upperFirst(t('common.messages.signup'))}</Link></Text>
				</KeyboardAwareScrollView>
				<KeyboardToolbar />
			</LinearGradient>
		</ImageBackground>
	</>
	)
};

export default LoginScreen;