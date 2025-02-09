import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
		<ReactQueryProvider>
			<AuthProvider>
				{children}
			</AuthProvider>
		</ReactQueryProvider>
	)
};

export { Providers };