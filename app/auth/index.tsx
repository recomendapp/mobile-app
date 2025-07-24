import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText"
import { Href, Link } from "expo-router";
import { useMemo } from "react";

const AuthScreen = () => {
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
		{
			label: 'onboarding',
			href: '/auth/onboarding',
		}
	]), [])
	return (
		<ThemedSafeAreaView>
			<ThemedText>AUTH SCREEEN</ThemedText>
			{routes.map((route, index) => (
				<Link key={index} href={route.href}>
					<ThemedText>
						{route.label}
					</ThemedText>
				</Link>
			))}
		</ThemedSafeAreaView>
	);
};

export default AuthScreen;