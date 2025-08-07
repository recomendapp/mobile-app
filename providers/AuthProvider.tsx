import { User } from "@/types/type.db";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useSupabaseClient } from "./SupabaseProvider";
import { useUserQuery } from "@/features/user/userQueries";
import { AppState } from "react-native";
import { supabase } from "@/lib/supabase/client";
import app from "@/constants/app";
import { useSplashScreen } from "./SplashScreenProvider";
import { useLocaleContext } from "./LocaleProvider";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

type AuthContextProps = {
	session: Session | null | undefined;
	user: User | null | undefined;
	login: (credentials: { email: string; password: string }) => Promise<void>;
	loginWithOtp: (email: string, redirectTo?: string | null) => Promise<void>;
	logout: () => Promise<void>;
	signup: (credentials: {
		email: string;
		name: string;
		username: string;
		password: string;
		language: string;
		redirectTo?: string;
	}) => Promise<void>;
	resetPasswordForEmail: (email: string) => Promise<void>;
	updateEmail: (email: string) => Promise<void>;
	verifyEmailChange: (email: string, token: string) => Promise<void>;
	cancelPendingEmailChange: () => Promise<void>;
	createSessionFromUrl: (url: string) => Promise<Session | null>;
};

type AuthProviderProps = {
	children: React.ReactNode;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({children }: AuthProviderProps) => {
	const { auth } = useSplashScreen();
	const { setLocale } = useLocaleContext();
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
		});

		supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
		});
	}, []);

	useEffect(() => {
		const syncLanguage = async () => {
			if (user?.language) {
				setLocale(user.language);
			}
		};
		if (user) {
			syncLanguage();
		}
	}, [user]);

	useEffect(() => {
		if (session === undefined) return;
		if (session && !user) return;
		auth.setReady(true);
	}, [session, user]);

	const login = async ({ email, password }: { email: string; password: string }) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error) throw error;
	};

	const loginWithOtp = async (email: string, redirectTo?: string | null) => {
		const { error } = await supabase.auth.signInWithOtp({
		email: email,
		options: {
			// emailRedirectTo: `${app.domain}/auth/callback${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`,
			emailRedirectTo: makeRedirectUri({
				path: "/auth/callback",
				queryParams: {
					redirect: redirectTo ? encodeURIComponent(redirectTo) : undefined,
				}
			})
		}
		});
		if (error) throw error;
	};

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
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
				// emailRedirectTo: `${app.domain}/auth/callback${credentials.redirectTo ? `?redirect=${encodeURIComponent(credentials.redirectTo)}` : ''}`,
				emailRedirectTo: makeRedirectUri({
					path: "/auth/callback",
					queryParams: {
						redirect: credentials.redirectTo ? encodeURIComponent(credentials.redirectTo) : undefined,
					}
				}),
				data: {
					full_name: credentials.name,
					username: credentials.username,
					language: credentials.language,
				}
			}
		})
		if (error) throw error;
	};

	const resetPasswordForEmail = async (email: string) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			// redirectTo: `${app.domain}/auth/reset-password`,
			redirectTo: makeRedirectUri({
				path: "/auth/reset-password",
			})
		});
		if (error) throw error;
	};

	const updateEmail = async (email: string) => {
		const { error } = await supabase.auth.updateUser({
			email: email,
		});
		if (error) throw error;
	};

	const verifyEmailChange = async (email: string, token: string) => {
		const { error } = await supabase.auth.verifyOtp({
			type: 'email_change',
			token: token,
			email: email,
		});
		if (error) throw error;
		const { error: refreshError } = await supabase.auth.refreshSession();
		if (refreshError) throw refreshError;
	};

	const cancelPendingEmailChange = async () => {
		const { error } = await supabase.rpc('utils_cancel_email_change');
		if (error) throw error;
		const { error: refreshError } = await supabase.auth.refreshSession();
    	if (refreshError) throw refreshError;
	};

	const createSessionFromUrl = async (url: string) => {
		const { params, errorCode } = QueryParams.getQueryParams(url);
		if (errorCode) throw new Error(errorCode);
		const { access_token, refresh_token } = params;
		if (!access_token) throw new Error("No access token provided in the URL");
		const { data, error } = await supabase.auth.setSession({
			access_token,
			refresh_token,
		});
		if (error) throw error;
		return data.session;
	};

	return (
		<AuthContext.Provider
		value={{
			session: session,
			user: user,
			login: login,
			loginWithOtp: loginWithOtp,
			logout: logout,
			signup: signup,
			resetPasswordForEmail: resetPasswordForEmail,
			updateEmail: updateEmail,
			verifyEmailChange: verifyEmailChange,
			cancelPendingEmailChange: cancelPendingEmailChange,
			createSessionFromUrl: createSessionFromUrl,
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
