import { createClient } from "@/lib/supabase/client";
import { Database } from "@recomendapp/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, use, useMemo } from "react";
import { useLocale } from "use-intl";

const SupabaseContext = createContext<SupabaseClient<Database> | undefined>(undefined);

export const SupabaseProvider = ({
	children,
} : {
	children: React.ReactNode;
}) => {
	const locale = useLocale();
	const supabase = useMemo(() => createClient(locale), [locale]);
	return (
		<SupabaseContext.Provider value={supabase}>
			{children}
		</SupabaseContext.Provider>
	);
}

export const useSupabaseClient = () => {
	const context = use(SupabaseContext);
	if (!context) {
		throw new Error('useSupabaseClient must be used within a SupabaseProvider');
	}
	return context;
};