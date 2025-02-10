import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
		<SupabaseProvider locale='en-US'>
			<ReactQueryProvider>
				<AuthProvider>
					{children}
				</AuthProvider>
			</ReactQueryProvider>
		</SupabaseProvider>
	)
};

export { Providers };