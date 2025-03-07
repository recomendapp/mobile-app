import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View} from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, buttonTextVariants } from '@/components/ui/button';
import { ThemedText } from '@/components/ui/ThemedText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { InputPassword } from '@/components/ui/input-password';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const LoginScreen = () => {
	const { login } = useAuth();
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
				Alert.alert(error.message);
			} else {
				Alert.alert('An unexpected error occurred. Please try again later.');
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
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className='w-full gap-4'>
					{/* EMAIL */}
					<View className='w-full'>
						<Label nativeID='email'>Email</Label>
						<Input
						nativeID="email"
						placeholder="Email"
						inputMode='email'
						autoComplete='email'
						autoCapitalize='none'
						value={email}
						onChangeText={setEmail}
						aria-labelledby="email"
						aria-errormessage="email"
						aria-disabled={isLoading}
						/>
					</View>
					{/* PASSWORD */}
					<View className='w-full'>
						<Label nativeID='password'>Password</Label>
						<InputPassword
						nativeID="password"
						placeholder="Password"
						autoComplete='password'
						autoCapitalize='none'
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						aria-labelledby="password"
						aria-errormessage="password"
						aria-disabled={isLoading}
						/>
					</View>
					{/* FORGOT PASSWORD */}
					<TouchableOpacity className='w-full'>
						<Text className="text-right text-muted-foreground">Forgot Password?</Text>
					</TouchableOpacity>
					{/* SUBMIT BUTTON */}
					<Button onPress={handleSubmit} disabled={isLoading} className='w-full !py-4 rounded-xl' size={'fit'}>
						{/* {isLoading ? <Icons.loading /> : null} */}
						<Text className='font-bold text-xl'>{t('common.word.login')}</Text>
					</Button>
				</KeyboardAvoidingView>
				{/* SIGNUP */}
				<Text className="text-right text-muted-foreground">Don't have an account? <Link href={'/auth/signup'} className={buttonTextVariants({ variant: 'link' })}>Sign Up</Link></Text>
			</LinearGradient>
		</ImageBackground>
	)
};

export default LoginScreen;