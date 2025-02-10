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

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const LoginScreen = () => {
	const { login } = useAuth();
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
				{/* <ThemedText className='text-4xl font-bold'>
					Welcome Back
				</ThemedText> */}
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className='w-full gap-4'>
					{/* EMAIL */}
					<View className='w-full'>
						<Label nativeID='email'>Email</Label>
						<Input
						nativeID="email"
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						aria-labelledby="email"
						aria-errormessage="email"
						aria-disabled={isLoading}
						className='border-foreground/80 rounded-full'
						/>
					</View>
					{/* PASSWORD */}
					<View className='w-full'>
						<Label nativeID='password'>Password</Label>
						<Input
						nativeID="password"
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						aria-labelledby="password"
						aria-errormessage="password"
						aria-disabled={isLoading}
						className='border-foreground/80 rounded-full'
						/>
					</View>
				</KeyboardAvoidingView>
				{/* FORGOT PASSWORD */}
				<TouchableOpacity className='w-full'>
					<Text className="text-right text-muted-foreground">Forgot Password?</Text>
				</TouchableOpacity>
				{/* SUBMIT BUTTON */}
				<Button onPress={handleSubmit} disabled={isLoading} className='w-full !py-4 rounded-full' size={'fit'}>
					{/* {isLoading ? <Icons.loading /> : null} */}
					<Text className='font-bold text-xl'>Log In</Text>
				</Button>
				{/* SIGNUP */}
				<Text className="text-right text-muted-foreground">Don't have an account? <Link href={'/auth/signup'} className={buttonTextVariants({ variant: 'link' })}>Sign Up</Link></Text>
			</LinearGradient>
		</ImageBackground>
	)
};

export default LoginScreen;