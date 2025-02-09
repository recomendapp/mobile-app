import { supabase } from "@/lib/supabase/client";
import { User } from "@/types/type.db";
import { Session } from "@supabase/supabase-js";
import { SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

type AuthContextProps = {
	session: Session | null | undefined;
	user: User | null | undefined;
};

type AuthProviderProps = {
	children: React.ReactNode;
};

const AuthContext = createContext<AuthContextProps | undefined>({
	session: undefined,
	user: undefined,
});

const AuthProvider = ({children }: AuthProviderProps) => {
	const [session, setSession] = useState<Session | null | undefined>(undefined);

	useEffect(() => {
		supabase.auth.getSession().then(({data: { session }}) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);
	return (
		<AuthContext.Provider
		value={{
			session: session,
			user: null
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
