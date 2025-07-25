import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText"
import { useRandomImage } from "@/hooks/useRandomImage";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Href, Link } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

const backgroundImages = [
	require('@/assets/images/auth/login/background/1.gif'),
]

const PADDING_X = 16;

const AuthScreen = () => {
	const { inset } = useTheme();
	const routes = useMemo<{
		label: string;
		href: Href;
	}[]>(() => ([
		{
			label: 'login',
			href: '/auth/login',
		},
		{
			label: 'signup',
			href: '/auth/signup',
		},
	]), []);
	const bgImage = useRandomImage(backgroundImages);
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
			style={[
				tw`flex-1 justify-end`,
				{
					// paddingLeft: inset.left + PADDING_X,
					// paddingRight: inset.right + PADDING_X,
					paddingTop: inset.top,
					paddingBottom: inset.bottom + 8,
				}
			]}
			>
				<View style={[tw`border-t-2 border-b-2 border-red-500`]}>
					{routes.map((route, index) => (
						<Link key={index} href={route.href}>
							<ThemedText>
								{route.label}
							</ThemedText>
						</Link>
					))}
				</View>
			</LinearGradient>
			{/* <ThemedSafeAreaView style={tw`bg-transparent`}>
				<ThemedText>AUTH SCREEEN</ThemedText>
			</ThemedSafeAreaView> */}
		</ImageBackground>
	);
};

export default AuthScreen;