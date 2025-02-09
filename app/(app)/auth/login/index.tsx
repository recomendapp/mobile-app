import { ImageBackground, StyleSheet } from 'react-native';
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from '@/components/ThemedText';
import { Icons } from '@/constants/Icons';

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const Login = () => {
	return (
		<ThemedView style={styles.container}>
			<ImageBackground source={backgroundImages[0]} style={StyleSheet.absoluteFill} />
			<ThemedView style={styles.card}>
				<Icons.site.logo width={128} height={128} color='#fff' style={{ color: '#fff' }} className='text-red-500' />
				<ThemedText type="title">Welcome back</ThemedText>
			</ThemedView>
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

export default Login;