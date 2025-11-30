import createClient from "@recomendapp/api-js";
import { createContext, use, useMemo } from "react";
import { useLocale } from "use-intl";
import { useAuth } from "./AuthProvider";

const ApiContext = createContext<ReturnType<typeof createClient> | undefined>(undefined);

export const ApiProvider = ({
	children,
} : {
	children: React.ReactNode;
}) => {
	const locale = useLocale();
	const { session } = useAuth();
	const api = useMemo(() => {
		return createClient({
			token: session?.access_token,
			language: locale,
		});
	}, [session, locale]);
	return (
		<ApiContext.Provider value={api}>
			{children}
		</ApiContext.Provider>
	);
}

export const useApiClient = () => {
	const context = use(ApiContext);
	if (!context) {
		throw new Error('useApiClient must be used within a ApiProvider');
	}
	return context;
};