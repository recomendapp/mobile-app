import { getType } from "@/lib/react-query/getType";
import queryClient from "@/lib/react-query/queryClient";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryNormalizerProvider } from "@normy/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

type ReactQueryProviderProps = {
	children: React.ReactNode;
};

const ReactQueryProvider = ({ children } : ReactQueryProviderProps) => {
	useReactQueryDevTools(queryClient);

	return (
		// <QueryNormalizerProvider
		// queryClient={queryClient}
		// normalizerConfig={{
		// 	getNormalizationObjectKey: obj => {
		// 	if (obj.id && getType(obj)) {
		// 		return `${getType(obj)}:${obj.id}`
		// 	} else if (obj.id) {
		// 		return `${obj.id}`
		// 	}
		// 	},
		// 	// devLogging: true,
		// }}
		// >
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		// </QueryNormalizerProvider>
	)
};

export { ReactQueryProvider };