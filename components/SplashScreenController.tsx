import { useAuth } from "@/providers/AuthProvider";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

interface SplashScreenControllerProps {
	children?: React.ReactNode;
};

SplashScreen.preventAutoHideAsync();

const SplashScreenController = ({
	children
} : SplashScreenControllerProps) => {
	const { session, user } = useAuth();
	useEffect(() => {
		if (session === undefined) return;
		if (session && !user) return;
		SplashScreen.hideAsync();
	}, [session, user]);

	return (children);
};

export default SplashScreenController;