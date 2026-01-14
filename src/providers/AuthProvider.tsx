import { User } from "@recomendapp/types";
import { Provider, Session } from "@supabase/supabase-js";
import { createContext, use, useCallback, useEffect, useState } from "react";
import { useSupabaseClient } from "./SupabaseProvider";
import { Alert, AppState, Platform } from "react-native";
import { supabase } from "@/lib/supabase/client";
import { useSplashScreen } from "./SplashScreenProvider";
import { useLocaleContext } from "./LocaleProvider";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";
import { defaultSupportedLocale, SupportedLocale, supportedLocales } from "@/translations/locales";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { CustomerInfo } from "react-native-purchases";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { randomUUID } from "expo-crypto";
import * as AppleAuthentication from 'expo-apple-authentication';
import * as env from '@/env';
import { useQueryClient } from "@tanstack/react-query";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { authKeys } from "@/api/auth/authKeys";
import { useAuthCustomerInfoQuery, useAuthUserQuery } from "@/api/auth/authQueries";

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
	customerInfo: CustomerInfo | undefined;
	login: (credentials: { email: string; password: string }) => Promise<void>;
	loginWithOAuth: (provider: Provider, redirectTo?: string | null) => Promise<void>;
	loginWithOtp: (email: string, redirectTo?: string | null) => Promise<void>;
	logout: () => Promise<void>;
	forceLogout: () => Promise<void>;
	safeLogout: (withConfirm?: boolean) => Promise<void>;
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
	pushToken: string | null;
	setPushToken: (token: string | null) => void;
};

type AuthProviderProps = {
	children: React.ReactNode;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
	const { auth } = useSplashScreen();
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { setLocale } = useLocaleContext();
	const supabase = useSupabaseClient();
	const redirectUri = AuthSession.makeRedirectUri();
	const [session, setSession] = useState<Session | null | undefined>(undefined);
	const [pushToken, setPushToken] = useState<string | null>(null);
	const {
		data: user,
	} = useAuthUserQuery({
		userId: session?.user.id,
	});
	const { customerInfo: initCustomerInfo } = useRevenueCat(session);
	const {
		data: customerInfo,
	} = useAuthCustomerInfoQuery({
		enabled: !!initCustomerInfo,
		initialData: initCustomerInfo,
	});

	// Functions
	const createSessionFromUrl = useCallback(async (url: string) => {
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
	}, [supabase]);

	// Handlers
	const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error) throw error;
	}, [supabase]);

	const loginWithOAuth = useCallback(async (provider: Provider, redirectTo?: string | null) => {
		switch (provider) {
			case "google":
				GoogleSignin.configure({
					scopes: ["https://www.googleapis.com/auth/drive.readonly"],
					iosClientId: env.GOOGLE_IOS_CLIENT_ID,
					webClientId: env.GOOGLE_WEB_CLIENT_ID,
				})
				await GoogleSignin.hasPlayServices();
				const userInfo = await GoogleSignin.signIn();
				if (userInfo.type === 'cancelled') throw new Error('cancelled');
				if (!userInfo.data?.idToken) {
					throw new Error('No ID token received');
				}
				const { error: googleError } = await supabase.auth.signInWithIdToken({
					provider: 'google',
					token: userInfo.data.idToken,
				});
				if (googleError) throw googleError;
				break;
			
			case 'apple':
				if (Platform.OS === 'ios') {
					try {
						const rawNone = randomUUID();
						const credential = await AppleAuthentication.signInAsync({
							requestedScopes: [
								AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
								AppleAuthentication.AppleAuthenticationScope.EMAIL,
							],
							state: rawNone,
						});
						if (credential.state !== rawNone) {
							throw new Error('State does not match');
						}
						const { identityToken } = credential;
						if (!identityToken) {
							throw new Error('No identity token provided');
						}
						const { error: appleError } = await supabase.auth.signInWithIdToken({
							provider: 'apple',
							token: identityToken,
						});
						if (appleError) throw appleError;
						break;
					} catch (error) {
						if (error instanceof Error) {
							if (!(
								('code' in error && error.code === 'ERR_REQUEST_CANCELED')
							)) {
								throw error;
							}
						} else {
							throw error;
						}
					}
				}
			default:
				const { data, error } = await supabase.auth.signInWithOAuth({
					provider: provider,
					options: {
						redirectTo: redirectUri,
						skipBrowserRedirect: true,
					},
				})
				if (error) throw error
				const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectUri);
				if (res.type === 'success') {
					const { url } = res
					await createSessionFromUrl(url)
				}
				break;
		}
	}, [supabase, redirectUri, createSessionFromUrl]);

	const loginWithOtp = useCallback(async (email: string, redirectTo?: string | null) => {
		const { error } = await supabase.auth.signInWithOtp({
			email: email,
			options: {
				emailRedirectTo: makeRedirectUri({
					path: "/auth/callback",
					queryParams: {
						redirect: redirectTo ? encodeURIComponent(redirectTo) : undefined,
					}
				})
			}
		});
		if (error) throw error;
	}, [supabase]);

	const logout = useCallback(async () => {
		if (pushToken) {
			const provider =
				Platform.OS === "ios" || Platform.OS === "macos"
					? "apns"
					: "fcm";
			await supabase.from("user_notification_tokens").delete().match({ token: pushToken, provider: provider });
		}
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		setSession(null);
		queryClient.removeQueries({
			queryKey: authKeys.user(),
		})
	}, [supabase, pushToken, queryClient]);

	const forceLogout = useCallback(async () => {
		await supabase.auth.signOut();
		await supabase.auth.setSession({
			access_token: '',
			refresh_token: '',
		});
		setSession(null);
		queryClient.removeQueries({
			queryKey: authKeys.user(),
		});
	}, [queryClient]);

	const safeLogout = useCallback(async (withConfirm = true) => {
		if (withConfirm) {
			Alert.alert(
				upperFirst(t('common.messages.are_u_sure')),
				undefined,
				[
					{
						text: upperFirst(t('common.messages.cancel')),
						style: 'cancel',
					},
					{
						text: upperFirst(t('common.messages.logout')),
						style: 'destructive',
						onPress: async () => {
							try {
								await logout();
							} catch {
								await forceLogout();
							}
						},
					},
				]
			);
		} else {
			try {
				await logout();
			} catch {
				await forceLogout();
			}
		}
	}, [logout, forceLogout, t]);

	const signup = useCallback(async (
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
	}, [supabase]);

	const resetPasswordForEmail = useCallback(async (email: string) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: makeRedirectUri({
				path: "/auth/reset-password",
			})
		});
		if (error) throw error;
	}, [supabase]);

	const updateEmail = useCallback(async (email: string) => {
		const { error } = await supabase.auth.updateUser({
			email: email,
		});
		if (error) throw error;
	}, [supabase]);

	const verifyEmailChange = useCallback(async (email: string, token: string) => {
		const { error } = await supabase.auth.verifyOtp({
			type: 'email_change',
			token: token,
			email: email,
		});
		if (error) throw error;
		const { error: refreshError } = await supabase.auth.refreshSession(session ? { refresh_token: session.refresh_token } : undefined);
		if (refreshError) throw refreshError;
	}, [supabase, session]);

	const cancelPendingEmailChange = useCallback(async () => {
		const { error } = await supabase.rpc('utils_cancel_email_change');
		if (error) throw error;
	}, [supabase]);

	const syncLanguage = useCallback(async (data: User) => {
		if (data?.language) {
			if (supportedLocales.includes(data.language as SupportedLocale)) {
				setLocale(data.language);
			} else {
				setLocale(defaultSupportedLocale);
			}
		}
	}, [setLocale]);

	// useEffects
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	useEffect(() => {
		if (user) {
			syncLanguage(user);
		}
	}, [user, syncLanguage]);

	useEffect(() => {
		if (session === undefined) return;
		if (session && !user) return;
		auth.setReady(true);
	}, [session, user, auth]);

	return (
		<AuthContext.Provider
		value={{
			session,
			user,
			customerInfo,
			login,
			loginWithOAuth,
			loginWithOtp,
			logout,
			forceLogout,
			safeLogout,
			signup,
			resetPasswordForEmail,
			updateEmail,
			verifyEmailChange,
			cancelPendingEmailChange,
			createSessionFromUrl,
			pushToken,
			setPushToken,
		}}
		>
			{children}
		</AuthContext.Provider>
	);
};

const useAuth = () => {
	const context = use(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export {
	AuthProvider,
	useAuth
};