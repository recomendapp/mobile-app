import { User } from "@/types/type.db";
import { Session } from "@supabase/supabase-js";
import { SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { useSupabaseClient } from "./SupabaseProvider";
import { useUserQuery } from "@/features/user/userQueries";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

type AuthContextProps = {
	session: Session | null | undefined;
	user: User | null | undefined;
	login: (credentials: { email: string; password: string }) => Promise<void>;
	logout: () => Promise<void>;
	signup: (credentials: {
		email: string;
		name: string;
		username: string;
		password: string;
		language: string;
		redirectTo?: string;
	}) => Promise<void>;
};

type AuthProviderProps = {
	children: React.ReactNode;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({children }: AuthProviderProps) => {
	const { i18n } = useTranslation();
	const supabase = useSupabaseClient();
	const [session, setSession] = useState<Session | null | undefined>(undefined);
	const {
		data: user,
	} = useUserQuery({
		userId: session?.user.id,
	});

	useEffect(() => {
		supabase.auth.getSession().then(({data: { session }}) => {
			setSession(session);
			SplashScreen.hide();
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	useEffect(() => {
		const syncLanguage = async () => {
			if (user?.language && user.language !== i18n.language) {
				await i18n.changeLanguage(user.language);
				await AsyncStorage.setItem("language", user.language);
			}
		};
		if (user) {
			syncLanguage();
		}
	}, [user, i18n]);

	const login = async ({ email, password }: { email: string; password: string }) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error) throw error;
	};

	const logout = async () => {
		await supabase.auth.signOut();
	};

	const signup = async (
		credentials: {
			email: string;
			name: string;
			username: string;
			password: string;
			language: string;
			redirectTo?: string;
		}
	) => {
		const { error } = await supabase.auth.signUp({
			email: credentials.email,
			password: credentials.password,
			options: {
				// TOOD: handle deep linking
				emailRedirectTo: undefined,
				data: {
					full_name: credentials.name,
					username: credentials.username,
					language: credentials.language,
				}
			}
		})
		if (error) throw error;
	};


	return (
		<AuthContext.Provider
		value={{
			session: session,
			user: user,
			login: login,
			logout: logout,
			signup: signup,
		}}
		>
			{children}
		</AuthContext.Provider>
	);
};

const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export {
	AuthProvider,
	useAuth
};
