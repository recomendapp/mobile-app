import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View} from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, buttonTextVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Link } from 'expo-router';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useDebounce from '@/hooks/useDebounce';

const backgroundImages = [
	require('@/assets/images/auth/signup/background/1.gif'),
]

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 15;
const FULL_NAME_MIN_LENGTH = 1;
const FULL_NAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;

const SignupScreen = () => {
	const { login } = useAuth();

	/* ------------------------------- FORM SCHEMA ------------------------------ */
	const signupSchema = z.object({
		email: z.string().email({
			// message: common('form.email.error.invalid'),
		}),
		username: z
		.string()
		.min(USERNAME_MIN_LENGTH, {
			// message: common('form.length.char_min', { count: USERNAME_MIN_LENGTH }),
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
	const usernameToCheck = useDebounce(form.watch('username'), 500);
	// OTP
	const numberOfDigits = 6;
	const [showOtp, setShowOtp] = useState<boolean>(false);



	// const handleSubmit = async () => {
	// 	try {
	// 		setIsLoading(true);
	// 		await login({ email: email, password: password });
	// 	} catch (error) {
	// 		if (error instanceof AuthError) {
	// 			Alert.alert(error.message);
	// 		} else {
	// 			Alert.alert('An unexpected error occurred. Please try again later.');
	// 		}
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// }
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

export default SignupScreen;