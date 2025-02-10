import { ImageBackground, StyleSheet, Text, View} from 'react-native';
// import { ThemedView } from "@/components/ThemedView";
// import { ThemedText } from '@/components/ThemedText';
import { Icons } from '@/constants/Icons';
import { AlignHorizontalJustifyEndIcon } from 'lucide-react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemedView } from '@/components/ui/ThemedView';
import { LoginPasswordForm } from '@/components/forms/LoginPasswordForm';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const LoginScreen = () => {
	return (
		<ThemedView className='flex-1 justify-center items-center p-2'>
			<ImageBackground source={backgroundImages[0]} style={StyleSheet.absoluteFill} />
			<Card className='w-full max-w-sm p-6 rounded-2xl gap-2'>
				<CardHeader className='p-0'>
					<CardTitle className='pb-2 text-center'>Login</CardTitle>
					<CardDescription className='text-base font-semibold text-center'>Discover the best movie recommendations.</CardDescription>
				</CardHeader>
				<CardContent className='grid gap-4 p-0'>
					<LoginPasswordForm />
				</CardContent>
			</Card>
		</ThemedView>
	)
};

const styles = StyleSheet.create({
	container: {
		height: '100%',
		width: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
	},
	card: {
		backgroundColor: 'transparent',
	}
});

export default LoginScreen;