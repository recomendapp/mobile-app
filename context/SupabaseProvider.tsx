"use client";

import { createClient } from "@/lib/supabase/client";
// import { routing } from "@/lib/i18n/routing";
import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo } from "react";

const SupabaseContext = createContext<SupabaseClient<Database> | undefined>(undefined);

export const SupabaseProvider = ({
	locale,
	children,
} : {
	locale: string;
	children: React.ReactNode;
}) => {
	const supabase = useMemo(() => {
		return createClient(locale);
	}, [locale]);

	return (
		<SupabaseContext.Provider value={supabase}>
			{children}
		</SupabaseContext.Provider>
	);
}

export const useSupabaseClient = () => {
	const context = useContext(SupabaseContext);
	if (!context) {
		throw new Error('useSupabaseClient must be used within a SupabaseProvider');
	}
	return context;
};