import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useAuth } from "@/context/AuthProvider";
import { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

const LoginPasswordForm = () => {
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
		<ThemedView className="gap-2">
			<View>
				<Label nativeID="email" className="sr-only">Email</Label>
				<Input
				nativeID="email"
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				aria-labelledby="email"
				aria-errormessage="email"
				aria-disabled={isLoading}
				/>
			</View>
			<View>
				<Label nativeID="password" className="sr-only">Password</Label>
				<Input
				nativeID="password"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				aria-labelledby="password"
				aria-errormessage="password"
				aria-disabled={isLoading}
				/>
			</View>
			<Button onPress={handleSubmit} disabled={isLoading}>
				{/* {isLoading ? <Icons.loading /> : null} */}
				<Text>Login</Text>
			</Button>
			<View>
				<TouchableOpacity>
					<Text className="text-right text-muted-foreground">Forgot Password?</Text>
				</TouchableOpacity>
			</View>
		</ThemedView>
	)
};

export { LoginPasswordForm };